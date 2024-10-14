/// <reference types="@nestjs/testing" />
/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { NFTService } from '../src/nft/nft.service';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../src/hedera/hedera.service';
import { CreateNFTDto } from '../src/dto/create-nft.dto';
import { UpdateNFTDto } from '../src/dto/update-nft.dto';
import { NotFoundException } from '@nestjs/common';

describe('NFTService', () => {
  let service: NFTService;
  let hederaService: HederaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NFTService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'HEDERA_NETWORK') return 'testnet';
              return 'mock_value';
            }),
          },
        },
        {
          provide: HederaService,
          useValue: {
            mintNFT: jest.fn(),
            getNFTInfo: jest.fn(),
            getFileContents: jest.fn(),
            createImmutableFile: jest.fn(),
            createTopic: jest.fn(),
            submitMessage: jest.fn(),
            getMessages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NFTService>(NFTService);
    hederaService = module.get<HederaService>(HederaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNFT', () => {
    it('should create an NFT', async () => {
      const mockCollectionId = '0.0.12345';
      const mockCreateNFTDto: CreateNFTDto = {
        name: 'Test NFT',
        description: 'A test NFT',
        attributes: [{ trait_type: 'color', value: 'red' }],
        image: 'https://example.com/image.png',
      };
      const mockSerialNumber = '1';

      jest.spyOn(hederaService, 'mintNFT').mockResolvedValue(mockSerialNumber);

      const result = await service.createNFT(mockCollectionId, mockCreateNFTDto);

      expect(hederaService.mintNFT).toHaveBeenCalledWith(mockCollectionId, expect.objectContaining(mockCreateNFTDto));
      expect(result).toBe(`${mockCollectionId}:${mockSerialNumber}`);
    });
  });

  describe('getNFTInfo', () => {
    it('should get NFT info', async () => {
      const mockNFTId = '0.0.12345:1';
      const mockNFTInfo = { metadata: 'bWV0YWRhdGE=' }; // Base64 encoded "metadata"
      const mockMetadata = { name: 'Test NFT' };

      jest.spyOn(hederaService, 'getNFTInfo').mockResolvedValue(mockNFTInfo);
      jest.spyOn(hederaService, 'getFileContents').mockResolvedValue(mockMetadata);

      const result = await service.getNFTInfo(mockNFTId);

      expect(hederaService.getNFTInfo).toHaveBeenCalledWith('0.0.12345', '1');
      expect(hederaService.getFileContents).toHaveBeenCalledWith('metadata');
      expect(result).toEqual({ ...mockNFTInfo, metadata: mockMetadata });
    });

    it('should throw NotFoundException for invalid NFT ID', async () => {
      const mockNFTId = 'invalid-id';

      await expect(service.getNFTInfo(mockNFTId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNFT', () => {
    it('should update NFT metadata', async () => {
      const mockNFTId = '0.0.12345:1';
      const mockUpdateNFTDto: UpdateNFTDto = { name: 'Updated NFT' };
      const mockCurrentInfo = { metadata: { name: 'Test NFT', description: 'A test NFT' } };
      const mockNewFileId = '0.0.67890';
      const mockEventTopic = 'topic-id';

      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(mockCurrentInfo);
      jest.spyOn(hederaService, 'createImmutableFile').mockResolvedValue(mockNewFileId);
      jest.spyOn(hederaService, 'createTopic').mockResolvedValue(mockEventTopic);
      jest.spyOn(hederaService, 'submitMessage').mockResolvedValue(undefined);

      await service.writeEvent(mockNFTId, mockUpdateNFTDto);

      expect(service.getNFTInfo).toHaveBeenCalledWith(mockNFTId);
      expect(hederaService.createImmutableFile).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated NFT',
        description: 'A test NFT',
      }));
      expect(hederaService.createTopic).toHaveBeenCalledWith(`NFT Update Event - ${mockNFTId}`);
      expect(hederaService.submitMessage).toHaveBeenCalledWith(mockEventTopic, expect.any(String));
    });
  });

  describe('getNFTHistory', () => {
    it('should get NFT history', async () => {
      const mockNFTId = '0.0.12345:1';
      const mockMessages = [
        { message: JSON.stringify({ type: 'MetadataUpdate', nftId: mockNFTId }), timestamp: new Date() },
      ];

      jest.spyOn(hederaService, 'getMessages').mockResolvedValue(mockMessages);

      const result = await service.getNFTHistory(mockNFTId);

      expect(hederaService.getMessages).toHaveBeenCalledWith(
        `NFT Update Event - ${mockNFTId}`,
        expect.any(Date),
        100,
        10000
      );
      expect(result).toEqual([JSON.parse(mockMessages[0].message)]);
    });

    it('should throw NotFoundException for invalid NFT ID', async () => {
      const mockNFTId = 'invalid-id';

      await expect(service.getNFTHistory(mockNFTId)).rejects.toThrow(NotFoundException);
    });
  });
});
