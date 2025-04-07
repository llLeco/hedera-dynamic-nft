import { Module } from '@nestjs/common';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { HederaService } from '../hedera/hedera.service';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [IpfsModule],
  controllers: [NFTController],
  providers: [NFTService, HederaService],
  exports: [NFTService],
})
export class NFTModule {}
