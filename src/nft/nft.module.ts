import { Module } from '@nestjs/common';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { HederaService } from '../hedera/hedera.service';

@Module({
  controllers: [NFTController],
  providers: [NFTService, HederaService],
})
export class NFTModule {}