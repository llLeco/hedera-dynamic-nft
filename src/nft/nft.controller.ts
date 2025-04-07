import { Controller, Get, Post, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NFTService } from './nft.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
import { IpfsService } from '../ipfs/ipfs.service';

@Controller('nft')
export class NFTController {
  constructor(
    private readonly nftService: NFTService,
    private readonly ipfsService: IpfsService,
  ) {}

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    const cid = await this.ipfsService.uploadImage(image.buffer);
    return { cid };
  }

  @Post(':collectionId')
  async createNFT(
    @Param('collectionId') collectionId: string,
    @Body() createNFTDto: CreateNFTDto,
  ) {
    return await this.nftService.createNFT(collectionId, createNFTDto);
  }

  @Get(':nftId')
  async getNFTInfo(@Param('nftId') nftId: string) {
    return await this.nftService.getNFTInfo(nftId);
  }

  @Get(':nftId/history')
  async getNFTHistory(@Param('nftId') nftId: string) {
    return await this.nftService.getNFTHistory(nftId);
  }

  @Post(':nftId/event')
  async writeEvent(@Param('nftId') nftId: string, @Body() eventData: any) {
    return await this.nftService.writeEvent(nftId, eventData);
  }
}
