import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NFTModule } from './nft/nft.module';
import { CollectionModule } from './collection/collection.module';
import { StaticController } from './static.controller';
import { IpfsModule } from './ipfs/ipfs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NFTModule,
    CollectionModule,
    IpfsModule,
  ],
  controllers: [StaticController],
  providers: [],
})
export class AppModule {}
