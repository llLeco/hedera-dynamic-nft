/// <reference types="@nestjs/testing" />
/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from '../src/collection/collection.service';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../src/hedera/hedera.service';
import { CreateCollectionDto } from '../src/dto/create-collection.dto';
import { Collection } from '../src/models/collection.model';

describe('CollectionService', () => {
  let service: CollectionService;
  let hederaService: HederaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
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
            createNFTCollection: jest.fn(),
            getCollectionInfo: jest.fn(),
            getNFTInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
    hederaService = module.get<HederaService>(HederaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCollection', () => {
    it('should create a collection', async () => {
      const createCollectionDto: CreateCollectionDto = {
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test collection',
      };
      const mockTokenId = '0.0.12345';

      jest.spyOn(hederaService, 'createNFTCollection').mockResolvedValue(mockTokenId);

      const result = await service.createCollection(createCollectionDto);

      expect(hederaService.createNFTCollection).toHaveBeenCalledWith(createCollectionDto.name, createCollectionDto.symbol);
      expect(result).toBeInstanceOf(Collection);
      expect(result.id).toBe(mockTokenId);
      expect(result.name).toBe(createCollectionDto.name);
      expect(result.symbol).toBe(createCollectionDto.symbol);
      expect(result.description).toBe(createCollectionDto.description);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getCollection', () => {
    it('should get collection info', async () => {
      const mockCollectionId = '0.0.12345';
      const mockCollectionInfo = {
        name: 'Test Collection',
        symbol: 'TEST',
      };

      jest.spyOn(hederaService, 'getCollectionInfo').mockResolvedValue(mockCollectionInfo);

      const result = await service.getCollection(mockCollectionId);

      expect(hederaService.getCollectionInfo).toHaveBeenCalledWith(mockCollectionId);
      expect(result).toBeInstanceOf(Collection);
      expect(result.id).toBe(mockCollectionId);
      expect(result.name).toBe(mockCollectionInfo.name);
      expect(result.symbol).toBe(mockCollectionInfo.symbol);
      expect(result.description).toBe('Description not available');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getAssetsInCollection', () => {
    it('should get assets in collection', async () => {
      const mockCollectionId = '0.0.12345';
      const mockNFTInfo = { serialNumber: '1', metadata: 'metadata' };

      jest.spyOn(hederaService, 'getNFTInfo')
        .mockResolvedValueOnce(mockNFTInfo)
        .mockRejectedValueOnce(new Error('NFT not found'));

      const result = await service.getAssetsInCollection(mockCollectionId);

      expect(hederaService.getNFTInfo).toHaveBeenCalledTimes(2);
      expect(hederaService.getNFTInfo).toHaveBeenCalledWith(mockCollectionId, '1');
      expect(hederaService.getNFTInfo).toHaveBeenCalledWith(mockCollectionId, '2');
      expect(result).toEqual([mockNFTInfo]);
    });

    it('should handle errors other than "NFT not found"', async () => {
      const mockCollectionId = '0.0.12345';
      const mockError = new Error('Unexpected error');

      jest.spyOn(hederaService, 'getNFTInfo').mockRejectedValue(mockError);

      await expect(service.getAssetsInCollection(mockCollectionId)).rejects.toThrow(mockError);
    });
  });
});
