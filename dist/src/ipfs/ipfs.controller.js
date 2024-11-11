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
exports.IpfsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const ipfs_service_1 = require("./ipfs.service");
let IpfsController = class IpfsController {
    constructor(ipfsService) {
        this.ipfsService = ipfsService;
    }
    async uploadImage(file) {
        const cid = await this.ipfsService.uploadImage(file.buffer);
        return { cid };
    }
    async getImage(cid) {
        return await this.ipfsService.getImage(cid);
    }
};
exports.IpfsController = IpfsController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IpfsController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)(':cid'),
    __param(0, (0, common_1.Param)('cid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IpfsController.prototype, "getImage", null);
exports.IpfsController = IpfsController = __decorate([
    (0, common_1.Controller)('ipfs'),
    __metadata("design:paramtypes", [ipfs_service_1.IpfsService])
], IpfsController);
//# sourceMappingURL=ipfs.controller.js.map