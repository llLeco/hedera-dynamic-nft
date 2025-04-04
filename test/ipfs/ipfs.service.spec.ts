import { Test, TestingModule } from '@nestjs/testing';
import { IpfsService } from '../../src/ipfs/ipfs.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { mockConfigService } from '../test-utils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('IpfsService', () => {
  let service: IpfsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IpfsService,
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<IpfsService>(IpfsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload an image to IPFS and return the CID', async () => {
      const mockImageBuffer = Buffer.from('test image data');
      const mockResponse = {
        data: {
          IpfsHash: 'QmTest123',
          PinSize: 1000,
          Timestamp: '2023-01-01T00:00:00Z',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await service.uploadImage(mockImageBuffer);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            pinata_api_key: 'test-api-key',
            pinata_secret_api_key: 'test-secret-key',
          },
        },
      );
      expect(result).toEqual('QmTest123');
    });

    it('should throw an error if the upload fails', async () => {
      const mockImageBuffer = Buffer.from('test image data');

      mockedAxios.post.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(service.uploadImage(mockImageBuffer)).rejects.toThrow('Upload failed');
    });
  });

  describe('getImage', () => {
    it('should retrieve an image from IPFS by CID', async () => {
      const mockCid = 'QmTest123';
      const mockImageData = Buffer.from('test image data');

      mockedAxios.get.mockResolvedValueOnce({ data: mockImageData });

      const result = await service.getImage(mockCid);

      expect(mockedAxios.get).toHaveBeenCalledWith(`https://gateway.pinata.cloud/ipfs/${mockCid}`, {
        responseType: 'arraybuffer',
      });
      expect(result).toEqual(mockImageData);
    });

    it('should throw an error if the image retrieval fails', async () => {
      const mockCid = 'QmTest123';

      mockedAxios.get.mockRejectedValueOnce(new Error('Retrieval failed'));

      await expect(service.getImage(mockCid)).rejects.toThrow('Retrieval failed');
    });
  });
});
