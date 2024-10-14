import { ConfigService as NestConfigService } from '@nestjs/config';
export declare class ConfigService {
    private configService;
    constructor(configService: NestConfigService);
    get hederaAccountId(): string;
    get hederaPrivateKey(): string;
    get hederaNetwork(): string;
    get port(): number;
    get nodeEnv(): string;
}
