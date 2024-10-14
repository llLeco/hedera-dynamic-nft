import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get hederaAccountId(): string {
    return this.configService.get<string>('HEDERA_ACCOUNT_ID') || '';
  }

  get hederaPrivateKey(): string {
    return this.configService.get<string>('HEDERA_PRIVATE_KEY') || '';
  }

  get hederaNetwork(): string {
    return this.configService.get<string>('HEDERA_NETWORK', 'testnet');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3000);
  }

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }
}
