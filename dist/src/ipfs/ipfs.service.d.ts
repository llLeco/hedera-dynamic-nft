import { ConfigService } from '@nestjs/config';
export declare class IpfsService {
    private configService;
    private readonly logger;
    private readonly pinataApiKey;
    private readonly pinataSecretKey;
    private readonly pinataBaseUrl;
    constructor(configService: ConfigService);
    uploadImage(imageBuffer: Buffer): Promise<string>;
    getImage(cid: string): Promise<Buffer>;
}
