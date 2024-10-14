"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTModule = void 0;
const common_1 = require("@nestjs/common");
const nft_controller_1 = require("./nft.controller");
const nft_service_1 = require("./nft.service");
const hedera_service_1 = require("../hedera/hedera.service");
let NFTModule = class NFTModule {
};
exports.NFTModule = NFTModule;
exports.NFTModule = NFTModule = __decorate([
    (0, common_1.Module)({
        controllers: [nft_controller_1.NFTController],
        providers: [nft_service_1.NFTService, hedera_service_1.HederaService],
    })
], NFTModule);
//# sourceMappingURL=nft.module.js.map