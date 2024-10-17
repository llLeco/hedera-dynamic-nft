import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NFTService } from './nft.service';
import { CreateNFTDto } from '../dto/create-nft.dto';

@Controller('nft')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Post(':collectionId')
  async createNFT(@Param('collectionId') collectionId: string, @Body() createNFTDto: CreateNFTDto) {
    return this.nftService.createNFT(collectionId, createNFTDto);
  }

  @Get(':nftId')
  async getNFTInfo(@Param('nftId') nftId: string) {
    return this.nftService.getNFTInfo(nftId);
  }

  @Get(':nftId/history')
  async getNFTHistory(@Param('nftId') nftId: string) {
    return this.nftService.getNFTHistory(nftId);
  }

  @Post(':nftId/event')
  async writeEvent(@Param('nftId') nftId: string, @Body() message: {name: string, description: string}) {
    return this.nftService.writeEvent(nftId, message);
  }
}
