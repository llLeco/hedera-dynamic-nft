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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var IpfsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpfsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let IpfsService = IpfsService_1 = class IpfsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(IpfsService_1.name);
        this.pinataBaseUrl = 'https://api.pinata.cloud';
        this.pinataApiKey = this.configService.get('PINATA_API_KEY');
        this.pinataSecretKey = this.configService.get('PINATA_SECRET_KEY');
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new Error('Pinata API credentials not found in environment variables');
        }
    }
    async uploadImage(imageBuffer) {
        try {
            const formData = new FormData();
            formData.append('file', new Blob([imageBuffer]));
            const response = await axios_1.default.post(`${this.pinataBaseUrl}/pinning/pinFileToIPFS`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    pinata_api_key: this.pinataApiKey,
                    pinata_secret_api_key: this.pinataSecretKey,
                },
            });
            return response.data.IpfsHash;
        }
        catch (error) {
            this.logger.error('Failed to upload image to Pinata:', error);
            throw error;
        }
    }
    async getImage(cid) {
        try {
            const response = await axios_1.default.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
                responseType: 'arraybuffer',
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error('Failed to retrieve image from Pinata:', error);
            throw error;
        }
    }
};
exports.IpfsService = IpfsService;
exports.IpfsService = IpfsService = IpfsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], IpfsService);
//# sourceMappingURL=ipfs.service.js.map