import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IpfsService } from './ipfs.service';

@Controller('ipfs')
export class IpfsController {
  constructor(private readonly ipfsService: IpfsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const cid = await this.ipfsService.uploadImage(file.buffer);
    return { cid };
  }

  @Get(':cid')
  async getImage(@Param('cid') cid: string) {
    return await this.ipfsService.getImage(cid);
  }
}
