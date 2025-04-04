import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { HederaService } from '../hedera/hedera.service';

@Module({
  controllers: [CollectionController],
  providers: [CollectionService, HederaService],
  exports: [CollectionService],
})
export class CollectionModule {}
