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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTService = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../hedera/hedera.service");
let NFTService = class NFTService {
    constructor(hederaService) {
        this.hederaService = hederaService;
    }
    async createNFT(collectionId, createNFTDto) {
        const metadata = {
            name: createNFTDto.name,
            description: createNFTDto.description,
            attributes: createNFTDto.attributes,
            image: createNFTDto.image,
        };
        const topicId = await this.hederaService.createTopic(`NFT Topic - ${collectionId}`);
        const metadataWithTopic = Object.assign(Object.assign({}, metadata), { topicId: topicId });
        const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);
        const serialNumber = await this.hederaService.mintNFT(collectionId, fileId);
        return `${collectionId}:${serialNumber}`;
    }
    async getNFTInfo(nftId) {
        const [collectionId, serialNumber] = nftId.split(':');
        if (!collectionId || !serialNumber) {
            throw new common_1.NotFoundException('Invalid NFT ID format');
        }
        const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
        console.log('NFT Info:', nftInfo);
        return nftInfo;
    }
    async writeEvent(nftId, message) {
        const [collectionId, serialNumber] = nftId.split(':');
        if (!collectionId || !serialNumber) {
            throw new common_1.NotFoundException('Invalid NFT ID format');
        }
        console.log('Writing event to NFT:', nftId);
        console.log('Message:', message);
        const currentInfo = await this.getNFTInfo(nftId);
        const messageWithTimestamp = {
            name: message.name,
            description: message.description,
            timestamp: new Date().toISOString(),
        };
        await this.hederaService.submitMessage(currentInfo.metadata.topicId, JSON.stringify(messageWithTimestamp));
    }
    async getNFTHistory(nftId) {
        const [collectionId, serialNumber] = nftId.split(':');
        if (!collectionId || !serialNumber) {
            throw new common_1.NotFoundException('Invalid NFT ID format');
        }
        const eventTopic = `NFT Update Event - ${nftId}`;
        const startTime = new Date(0);
        const messages = await this.hederaService.getMessages(eventTopic, startTime, 100, 10000);
        return messages.map(msg => msg.message);
    }
};
exports.NFTService = NFTService;
exports.NFTService = NFTService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], NFTService);
//# sourceMappingURL=nft.service.js.map