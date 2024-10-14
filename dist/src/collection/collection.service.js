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
exports.CollectionService = void 0;
const common_1 = require("@nestjs/common");
const hedera_service_1 = require("../hedera/hedera.service");
const collection_model_1 = require("../models/collection.model");
let CollectionService = class CollectionService {
    constructor(hederaService) {
        this.hederaService = hederaService;
    }
    async createCollection(createCollectionDto) {
        const { name, symbol, description } = createCollectionDto;
        const tokenId = await this.hederaService.createNFTCollection(name, symbol);
        return new collection_model_1.Collection({
            id: tokenId,
            name,
            symbol,
            description,
            createdAt: new Date()
        });
    }
    async getCollection(collectionId) {
        const info = await this.hederaService.getCollectionInfo(collectionId);
        return new collection_model_1.Collection({
            id: collectionId,
            name: info.name,
            symbol: info.symbol,
            description: 'Description not available',
            createdAt: new Date()
        });
    }
    async getAssetsInCollection(collectionId) {
        const nfts = [];
        for (let i = 1; i <= 100; i++) {
            try {
                const nftInfo = await this.hederaService.getNFTInfo(collectionId, i.toString());
                nfts.push(nftInfo);
            }
            catch (error) {
                if (error.message === 'NFT not found') {
                    break;
                }
                throw error;
            }
        }
        return nfts;
    }
};
exports.CollectionService = CollectionService;
exports.CollectionService = CollectionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hedera_service_1.HederaService])
], CollectionService);
//# sourceMappingURL=collection.service.js.map