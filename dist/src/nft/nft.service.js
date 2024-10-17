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
var NFTService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTService = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../hedera/hedera.service");
let NFTService = NFTService_1 = class NFTService {
    constructor(hederaService) {
        this.hederaService = hederaService;
        this.logger = new common_1.Logger(NFTService_1.name);
    }
    async createNFT(collectionId, createNFTDto) {
        this.logger.log(`Creating NFT in collection: ${collectionId}`);
        const metadata = {
            name: createNFTDto.name,
            description: createNFTDto.description,
            attributes: createNFTDto.attributes,
            image: createNFTDto.image,
        };
        try {
            const topicId = await this.hederaService.createTopic(`NFT Topic - ${collectionId}`);
            const metadataWithTopic = Object.assign(Object.assign({}, metadata), { topicId });
            const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);
            const serialNumber = await this.hederaService.mintNFT(collectionId, fileId);
            const nftId = `${collectionId}:${serialNumber}`;
            this.logger.log(`NFT created successfully: ${nftId}`);
            return nftId;
        }
        catch (error) {
            this.logger.error(`Error creating NFT: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNFTInfo(nftId) {
        const [collectionId, serialNumber] = this.parseNftId(nftId);
        try {
            const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
            this.logger.log(`Retrieved info for NFT: ${nftId}`);
            if (typeof nftInfo.metadata === 'string') {
                try {
                    nftInfo.metadata = JSON.parse(nftInfo.metadata);
                }
                catch (error) {
                    this.logger.warn(`Failed to parse metadata as JSON for NFT ${nftId}`);
                }
            }
            return nftInfo;
        }
        catch (error) {
            this.logger.error(`Error retrieving NFT info: ${error.message}`, error.stack);
            throw error;
        }
    }
    async writeEvent(nftId, message) {
        const [collectionId, serialNumber] = this.parseNftId(nftId);
        this.logger.log(`Writing event to NFT: ${nftId}`);
        this.logger.debug('Event message:', message);
        try {
            const currentInfo = await this.getNFTInfo(nftId);
            const messageWithTimestamp = Object.assign(Object.assign({}, message), { timestamp: new Date().toISOString() });
            await this.hederaService.submitMessage(currentInfo.metadata.topicId, JSON.stringify(messageWithTimestamp));
            this.logger.log(`Event written successfully to NFT: ${nftId}`);
        }
        catch (error) {
            this.logger.error(`Error writing event to NFT: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getNFTHistory(nftId) {
        const [collectionId, serialNumber] = this.parseNftId(nftId);
        this.logger.log(`Retrieving history for NFT: ${nftId}`);
        try {
            const currentInfo = await this.getNFTInfo(nftId);
            const startTime = new Date(0);
            const messages = await this.hederaService.getMessages(currentInfo.metadata.topicId, startTime, 100, 10000);
            this.logger.log(`Retrieved ${messages.length} historical events for NFT: ${nftId}`);
            return messages.map(msg => msg.message);
        }
        catch (error) {
            this.logger.error(`Error retrieving NFT history: ${error.message}`, error.stack);
            throw error;
        }
    }
    parseNftId(nftId) {
        const [collectionId, serialNumber] = nftId.split(':');
        if (!collectionId || !serialNumber) {
            this.logger.error(`Invalid NFT ID format: ${nftId}`);
            throw new common_1.NotFoundException('Invalid NFT ID format');
        }
        return [collectionId, serialNumber];
    }
};
exports.NFTService = NFTService;
exports.NFTService = NFTService = NFTService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], NFTService);
//# sourceMappingURL=nft.service.js.map