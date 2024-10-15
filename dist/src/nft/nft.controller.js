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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTController = void 0;
const common_1 = require("@nestjs/common");
const nft_service_1 = require("./nft.service");
const create_nft_dto_1 = require("../dto/create-nft.dto");
let NFTController = class NFTController {
    constructor(nftService) {
        this.nftService = nftService;
    }
    async createNFT(collectionId, createNFTDto) {
        return this.nftService.createNFT(collectionId, createNFTDto);
    }
    async getNFTInfo(nftId) {
        return this.nftService.getNFTInfo(nftId);
    }
    async getNFTHistory(nftId) {
        return this.nftService.getNFTHistory(nftId);
    }
    async writeEvent(nftId, message) {
        return this.nftService.writeEvent(nftId, message);
    }
};
exports.NFTController = NFTController;
__decorate([
    (0, common_1.Post)(':collectionId'),
    __param(0, (0, common_1.Param)('collectionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_nft_dto_1.CreateNFTDto]),
    __metadata("design:returntype", Promise)
], NFTController.prototype, "createNFT", null);
__decorate([
    (0, common_1.Get)(':nftId'),
    __param(0, (0, common_1.Param)('nftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NFTController.prototype, "getNFTInfo", null);
__decorate([
    (0, common_1.Get)(':nftId/history'),
    __param(0, (0, common_1.Param)('nftId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NFTController.prototype, "getNFTHistory", null);
__decorate([
    (0, common_1.Post)(':nftId/event'),
    __param(0, (0, common_1.Param)('nftId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], NFTController.prototype, "writeEvent", null);
exports.NFTController = NFTController = __decorate([
    (0, common_1.Controller)('nft'),
    __metadata("design:paramtypes", [nft_service_1.NFTService])
], NFTController);
//# sourceMappingURL=nft.controller.js.map