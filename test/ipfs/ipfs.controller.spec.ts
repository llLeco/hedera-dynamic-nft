import { Test, TestingModule } from '@nestjs/testing';
import { IpfsController } from '../../src/ipfs/ipfs.controller';
import { IpfsService } from '../../src/ipfs/ipfs.service';
import { mockIpfsService } from '../test-utils';

describe('IpfsController', () => {
  let controller: IpfsController;
  let ipfsService: IpfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IpfsController],
      providers: [
        {
          provide: IpfsService,
          useFactory: mockIpfsService,
        },
      ],
    }).compile();

    controller = module.get<IpfsController>(IpfsController);
    ipfsService = module.get<IpfsService>(IpfsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image and return the CID', async () => {
      const mockFile = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 12345,
        buffer: Buffer.from('test image data'),
      } as Express.Multer.File;

      const mockCid = 'QmTest123';

      jest.spyOn(ipfsService, 'uploadImage').mockResolvedValue(mockCid);

      const result = await controller.uploadImage(mockFile);

      expect(ipfsService.uploadImage).toHaveBeenCalledWith(mockFile.buffer);
      expect(result).toEqual({ cid: mockCid });
    });
  });

  describe('getImage', () => {
    it('should retrieve an image by CID', async () => {
      const mockCid = 'QmTest123';
      const mockImageBuffer = Buffer.from('test image data');

      jest.spyOn(ipfsService, 'getImage').mockResolvedValue(mockImageBuffer);

      const result = await controller.getImage(mockCid);

      expect(ipfsService.getImage).toHaveBeenCalledWith(mockCid);
      expect(result).toEqual(mockImageBuffer);
    });
  });
});
