import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class StaticController {
  @Get()
  serveIndex(@Res() res: Response) {
    res.sendFile('index.html');
  }
}
