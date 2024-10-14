import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, TokenMintTransaction, TokenInfoQuery, TokenNftInfoQuery, NftId, TokenId, FileCreateTransaction, FileContentsQuery, TopicCreateTransaction, TopicMessageSubmitTransaction, TopicMessageQuery, Hbar, TopicId, } from "@hashgraph/sdk";
import * as dotenv from 'dotenv';
import * as path from 'path';

@Injectable()
export class HederaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(HederaService.name);
  private client: Client;

  constructor() {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  }

  async onModuleInit() {
    await this.initializeClient();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
    }
  }

  private async initializeClient() {
    const operatorId = process.env.HEDERA_ACCOUNT_ID;
    const operatorKey = process.env.HEDERA_PRIVATE_KEY;

    if (!operatorId || !operatorKey) {
      throw new Error('Environment variables HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present');
    }

    try {
      const accountId = AccountId.fromString(operatorId);
      this.client = Client.forTestnet();
      this.client.setOperator(accountId, operatorKey);
    } catch (error) {
      console.error('Error initializing Hedera client:', error);
      throw error;
    }
  }

  async createNFTCollection(name: string, symbol: string): Promise<string> {
    const treasuryAccountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const treasuryKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    const nftCreate = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryAccountId)
      .setSupplyType(TokenSupplyType.Finite)
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

  async mintNFT(collectionId: string, fileId: string): Promise<string> {
    const supplyKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    const mintTx = await new TokenMintTransaction()
      .setTokenId(collectionId)
      .setMetadata([Buffer.from(fileId)])
      .freezeWith(this.client);

    const mintTxSign = await mintTx.sign(supplyKey);
    const mintTxSubmit = await mintTxSign.execute(this.client);
    const mintRx = await mintTxSubmit.getReceipt(this.client);

    const serialNumber = mintRx.serials[0].low.toString();
    this.logger.log(`Minted NFT ${collectionId} with serial: ${serialNumber}, referencing file: ${fileId}`);

    return serialNumber;
  }

  public async createImmutableFile(content: any): Promise<string> {
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([]) // No keys means the file is immutable
      .setContents(JSON.stringify(content))
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(this.client);

    const signedTx = await fileCreateTx.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
    const submitTx = await signedTx.execute(this.client);
    const receipt = await submitTx.getReceipt(this.client);

    return receipt.fileId.toString();
  }

  async getFileContents(fileId: string): Promise<any> {
    const query = new FileContentsQuery()
      .setFileId(fileId);

    const contents = await query.execute(this.client);
    return JSON.parse(contents.toString());
  }

  async getCollectionInfo(tokenId: string): Promise<any> {
    const query = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));
    const tokenInfo = await query.execute(this.client);

    return {
      tokenId: tokenId,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      totalSupply: tokenInfo.totalSupply.toString(),
      maxSupply: tokenInfo.maxSupply.toString(),
    };
  }

  async getNFTInfo(tokenId: string, serialNumber: string): Promise<any> {
    const nftId = new NftId(TokenId.fromString(tokenId), serialNumber);
    const nftInfo = await new TokenNftInfoQuery()
      .setNftId(nftId)
      .execute(this.client);

    if (nftInfo.length === 0) {
      throw new Error('NFT not found');
    }

    const fileId = Buffer.from(nftInfo[0].metadata).toString('utf8');
    const fileContents = await this.getFileContents(fileId);

    //read topic on fileContents.topicId
    const topicId = fileContents.topicId;
    const messages = await this.getMessages(topicId, new Date(0), 100, 10000); //!Not working

    return {
      tokenId: nftInfo[0].nftId.tokenId.toString(),
      serialNumber: nftInfo[0].nftId.serial.toString(),
      owner: nftInfo[0].accountId.toString(),
      metadata: fileContents,
      // messages: messages,
      creationTime: nftInfo[0].creationTime.toDate(),
    };
  }

  async createTopic(memo: string): Promise<string> {
    const transaction = new TopicCreateTransaction()
      .setAdminKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
      .setSubmitKey(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY))
      .setTopicMemo(memo)
      .setMaxTransactionFee(new Hbar(2));

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    return receipt.topicId.toString();
  }

  async submitMessage(topicId: string, message: string): Promise<string> {
    const transaction = await new TopicMessageSubmitTransaction({
      topicId,
      message,
    }).freezeWith(this.client);

    const signTx = await transaction.sign(PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY));
    const txResponse = await signTx.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return receipt.status.toString();
  }

  async getMessages(topicId: string, startTime: Date, messageCount: number, timeout: number): Promise<Array<{ message: string, timestamp: Date }>> {
    return new Promise<Array<{ message: string, timestamp: Date }>>((resolve, reject) => {
      const messages: Array<{ message: string, timestamp: Date }> = [];
      const topicIdObj = TopicId.fromString(topicId);

      const subscription = new TopicMessageQuery()
        .setTopicId(topicIdObj)
        .setStartTime(startTime)
        .subscribe(
          this.client,
          (error) => {
            if (error) {
              this.logger.error(`Subscription error: ${error}`);
              subscription.unsubscribe();
            }
          },
          (message) => {
            const buffer = Buffer.from(message.contents).toString("utf8");
            const parsedMessage = JSON.parse(buffer);
            messages.push({
              message: parsedMessage,
              timestamp: message.consensusTimestamp.toDate()
            });
            if (messages.length >= messageCount) {
              subscription.unsubscribe();
              resolve(messages);
            }
          }
        );

      setTimeout(() => {
        subscription.unsubscribe();
        resolve(messages);
      }, timeout);
    });
  }
}
