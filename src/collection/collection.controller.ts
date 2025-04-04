import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  async createCollection(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.createCollection(createCollectionDto);
  }

  @Get(':collectionId')
  async getCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getCollection(collectionId);
  }

  @Get(':collectionId/assets')
  async getAssetsInCollection(@Param('collectionId') collectionId: string) {
    return this.collectionService.getAssetsInCollection(collectionId);
  }
}
