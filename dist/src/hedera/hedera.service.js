"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var HederaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaService = void 0;
const common_1 = require("@nestjs/common");
const sdk_1 = require("@hashgraph/sdk");
const config_1 = require("@nestjs/config");
let HederaService = HederaService_1 = class HederaService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(HederaService_1.name);
    }
    async onModuleInit() {
        await this.initializeClient();
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.close();
        }
    }
    async initializeClient() {
        const operatorId = this.configService.get('HEDERA_ACCOUNT_ID');
        const operatorKey = this.configService.get('HEDERA_PRIVATE_KEY');
        if (!operatorId || !operatorKey) {
            throw new Error('Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present');
        }
        try {
            const accountId = sdk_1.AccountId.fromString(operatorId);
            this.client = sdk_1.Client.forTestnet();
            this.client.setOperator(accountId, operatorKey);
        }
        catch (error) {
            this.logger.error('Error initializing Hedera client:', error);
            throw error;
        }
    }
    async createNFTCollection(name, symbol) {
        const treasuryAccountId = sdk_1.AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
        const treasuryKey = sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
        const nftCreate = await new sdk_1.TokenCreateTransaction()
            .setTokenName(name)
            .setTokenSymbol(symbol)
            .setTokenType(sdk_1.TokenType.NonFungibleUnique)
            .setDecimals(0)
            .setInitialSupply(0)
            .setTreasuryAccountId(treasuryAccountId)
            .setSupplyType(sdk_1.TokenSupplyType.Finite)
            .setMaxSupply(1000000)
            .setSupplyKey(treasuryKey)
            .freezeWith(this.client);
        const nftCreateTxSign = await nftCreate.sign(treasuryKey);
        const nftCreateSubmit = await nftCreateTxSign.execute(this.client);
        const nftCreateRx = await nftCreateSubmit.getReceipt(this.client);
        const tokenId = nftCreateRx.tokenId;
        this.logger.log(`Created NFT Collection with Token ID: ${tokenId}`);
        return tokenId.toString();
    }
    async mintNFT(collectionId, fileId) {
        const supplyKey = sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);
        const mintTx = await new sdk_1.TokenMintTransaction()
            .setTokenId(collectionId)
            .setMetadata([Buffer.from(fileId.toString())])
            .freezeWith(this.client);
        const mintTxSign = await mintTx.sign(supplyKey);
        const mintTxSubmit = await mintTxSign.execute(this.client);
        const mintRx = await mintTxSubmit.getReceipt(this.client);
        const serialNumber = mintRx.serials[0].low.toString();
        this.logger.log(`Minted NFT ${collectionId} with serial: ${serialNumber}, referencing file: ${fileId}`);
        return serialNumber;
    }
    async createImmutableFile(content) {
        const fileCreateTx = new sdk_1.FileCreateTransaction()
            .setKeys([])
            .setContents(JSON.stringify(content))
            .setMaxTransactionFee(new sdk_1.Hbar(2))
            .freezeWith(this.client);
        const signedTx = await fileCreateTx.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
        const submitTx = await signedTx.execute(this.client);
        const receipt = await submitTx.getReceipt(this.client);
        return receipt.fileId.toString();
    }
    async getFileContents(fileId) {
        const query = new sdk_1.FileContentsQuery()
            .setFileId(fileId);
        const contents = await query.execute(this.client);
        return JSON.parse(contents.toString());
    }
    async getCollectionInfo(tokenId) {
        const query = new sdk_1.TokenInfoQuery().setTokenId(sdk_1.TokenId.fromString(tokenId));
        const tokenInfo = await query.execute(this.client);
        return {
            tokenId: tokenId,
            name: tokenInfo.name,
            symbol: tokenInfo.symbol,
            totalSupply: tokenInfo.totalSupply.toString(),
            maxSupply: tokenInfo.maxSupply.toString(),
        };
    }
    async getNFTInfo(tokenId, serialNumber) {
        const nftId = new sdk_1.NftId(sdk_1.TokenId.fromString(tokenId), serialNumber);
        const nftInfo = await new sdk_1.TokenNftInfoQuery()
            .setNftId(nftId)
            .execute(this.client);
        if (nftInfo.length === 0) {
            throw new Error('NFT not found');
        }
        const metadata = nftInfo[0].metadata.toString().trim();
        let parsedMetadata;
        let messages;
        if (metadata.match(/^0\.0\.\d+$/)) {
            parsedMetadata = await this.getFileContents(metadata);
            messages = await this.getMessages(parsedMetadata.topicId, new Date(0), 100, 10000);
        }
        else {
            parsedMetadata = this.tryParseJSON(metadata) || { rawMetadata: metadata };
        }
        return {
            tokenId: nftInfo[0].nftId.tokenId.toString(),
            serialNumber: nftInfo[0].nftId.serial.toString(),
            owner: nftInfo[0].accountId.toString(),
            metadata: parsedMetadata,
            messages,
            creationTime: nftInfo[0].creationTime.toDate(),
        };
    }
    tryParseJSON(str) {
        try {
            return JSON.parse(str);
        }
        catch (error) {
            this.logger.warn('Error parsing metadata as JSON:', error);
            return null;
        }
    }
    async createTopic(memo) {
        const transaction = new sdk_1.TopicCreateTransaction()
            .setAdminKey(sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
            .setSubmitKey(sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
            .setTopicMemo(memo)
            .setMaxTransactionFee(new sdk_1.Hbar(2));
        const txResponse = await transaction.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        return receipt.topicId.toString();
    }
    async submitMessage(topicId, message) {
        const transaction = await new sdk_1.TopicMessageSubmitTransaction({
            topicId,
            message,
        }).freezeWith(this.client);
        const signTx = await transaction.sign(sdk_1.PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
        const txResponse = await signTx.execute(this.client);
        const receipt = await txResponse.getReceipt(this.client);
        return receipt.status.toString();
    }
    async getMessages(topicId, startTime, messageCount, timeout) {
        return new Promise((resolve, reject) => {
            const messages = [];
            const topicIdObj = sdk_1.TopicId.fromString(topicId);
            this.logger.log(`Fetching messages for topic ${topicId}`);
            const attemptSubscription = (attempt = 0) => {
                let subscription;
                try {
                    subscription = new sdk_1.TopicMessageQuery()
                        .setTopicId(topicIdObj)
                        .setStartTime(startTime)
                        .subscribe(this.client, (error) => {
                        if (error) {
                            this.logger.error(`Subscription error (attempt ${attempt}): ${error}`);
                            if (subscription)
                                subscription.unsubscribe();
                            if (attempt < 3) {
                                setTimeout(() => attemptSubscription(attempt + 1), 1000 * (attempt + 1));
                            }
                            else {
                                reject(new Error(`Failed to subscribe after ${attempt} attempts: ${error}`));
                            }
                        }
                    }, (message) => {
                        try {
                            const parsedMessage = JSON.parse(Buffer.from(message.contents).toString("utf8"));
                            messages.push(parsedMessage);
                            if (messages.length >= messageCount) {
                                if (subscription)
                                    subscription.unsubscribe();
                                resolve(messages);
                            }
                        }
                        catch (parseError) {
                            this.logger.error(`Error parsing message: ${parseError}`);
                        }
                    });
                }
                catch (setupError) {
                    this.logger.error(`Error setting up subscription (attempt ${attempt}): ${setupError}`);
                    if (attempt < 3) {
                        setTimeout(() => attemptSubscription(attempt + 1), 1000 * (attempt + 1));
                    }
                    else {
                        reject(new Error(`Failed to set up subscription after ${attempt} attempts: ${setupError}`));
                    }
                }
            };
            attemptSubscription();
            setTimeout(() => {
                resolve(messages);
            }, timeout);
        });
    }
};
exports.HederaService = HederaService;
exports.HederaService = HederaService = HederaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HederaService);
//# sourceMappingURL=hedera.service.js.map