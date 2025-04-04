import { Test, TestingModule } from '@nestjs/testing';
import { NFTController } from '../../src/nft/nft.controller';
import { NFTService } from '../../src/nft/nft.service';
import { CreateNFTDto } from '../../src/dto/create-nft.dto';
import { NotFoundException } from '@nestjs/common';

describe('NFTController', () => {
  let controller: NFTController;
  let nftService: NFTService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NFTController],
      providers: [
        {
          provide: NFTService,
          useValue: {
            createNFT: jest.fn(),
            getNFTInfo: jest.fn(),
            writeEvent: jest.fn(),
            getNFTHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NFTController>(NFTController);
    nftService = module.get<NFTService>(NFTService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createNFT', () => {
    it('should create a new NFT', async () => {
      const collectionId = '0.0.12345';
      const createNFTDto: CreateNFTDto = {
        name: 'Test NFT',
        description: 'A test NFT',
        attributes: [{ trait_type: 'color', value: 'red' }],
        image: 'ipfs://QmTest123',
      };
      const nftId = '0.0.12345:1';

      jest.spyOn(nftService, 'createNFT').mockResolvedValue(nftId);

      const result = await controller.createNFT(collectionId, createNFTDto);

      expect(nftService.createNFT).toHaveBeenCalledWith(collectionId, createNFTDto);
      expect(result).toEqual(nftId);
    });
  });

  describe('getNFTInfo', () => {
    it('should return NFT information', async () => {
      const nftId = '0.0.12345:1';
      const nftInfo = {
        tokenId: '0.0.12345',
        serialNumber: '1',
        owner: '0.0.12345',
        metadata: { name: 'Test NFT', description: 'A test NFT' },
        creationTime: new Date(),
      };

      jest.spyOn(nftService, 'getNFTInfo').mockResolvedValue(nftInfo);

      const result = await controller.getNFTInfo(nftId);

      expect(nftService.getNFTInfo).toHaveBeenCalledWith(nftId);
      expect(result).toEqual(nftInfo);
    });

    it('should throw NotFoundException when NFT is not found', async () => {
      const nftId = '0.0.12345:999';

      jest
        .spyOn(nftService, 'getNFTInfo')
        .mockRejectedValue(new NotFoundException('NFT not found'));

      await expect(controller.getNFTInfo(nftId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('writeEvent', () => {
    it('should add an event to an NFT', async () => {
      const nftId = '0.0.12345:1';
      const event = { name: 'Test Event', description: 'Event Description' };

      jest.spyOn(nftService, 'writeEvent').mockResolvedValue(undefined);

      await controller.writeEvent(nftId, event);

      expect(nftService.writeEvent).toHaveBeenCalledWith(nftId, event);
    });
  });

  describe('getNFTHistory', () => {
    it('should return NFT history', async () => {
      const nftId = '0.0.12345:1';
      const history = [
        { name: 'Event 1', description: 'Description 1', timestamp: new Date().toISOString() },
        { name: 'Event 2', description: 'Description 2', timestamp: new Date().toISOString() },
      ];

      jest.spyOn(nftService, 'getNFTHistory').mockResolvedValue(history);

      const result = await controller.getNFTHistory(nftId);

      expect(nftService.getNFTHistory).toHaveBeenCalledWith(nftId);
      expect(result).toEqual(history);
    });
  });
});
