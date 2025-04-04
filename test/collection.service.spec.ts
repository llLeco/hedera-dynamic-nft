import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from '../src/collection/collection.service';
import { HederaService } from '../src/hedera/hedera.service';
import { CreateCollectionDto } from '../src/dto/create-collection.dto';
import { Collection } from '../src/models/collection.model';
import { NotFoundException } from '@nestjs/common';

describe('CollectionService', () => {
  let service: CollectionService;
  let hederaService: HederaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
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
      const tokenId = '0.0.12345';

      jest.spyOn(hederaService, 'createNFTCollection').mockResolvedValue(tokenId);

      const result = await service.createCollection(createCollectionDto);

      expect(hederaService.createNFTCollection).toHaveBeenCalledWith('Test Collection', 'TEST');
      expect(result).toBeInstanceOf(Collection);
      expect(result.id).toBe(tokenId);
      expect(result.name).toBe(createCollectionDto.name);
      expect(result.symbol).toBe(createCollectionDto.symbol);
      expect(result.description).toBe(createCollectionDto.description);
    });
  });

  describe('getCollection', () => {
    it('should get a collection', async () => {
      const collectionId = '0.0.12345';
      const collectionInfo = {
        tokenId: collectionId,
        name: 'Test Collection',
        symbol: 'TEST',
        totalSupply: '5',
        maxSupply: '1000',
      };

      jest.spyOn(hederaService, 'getCollectionInfo').mockResolvedValue(collectionInfo);

      const result = await service.getCollection(collectionId);

      expect(hederaService.getCollectionInfo).toHaveBeenCalledWith(collectionId);
      expect(result).toBeInstanceOf(Collection);
      expect(result.id).toBe(collectionId);
      expect(result.name).toBe(collectionInfo.name);
      expect(result.symbol).toBe(collectionInfo.symbol);
    });

    it('should throw NotFoundException when collection is not found', async () => {
      const collectionId = '0.0.99999';

      jest
        .spyOn(hederaService, 'getCollectionInfo')
        .mockRejectedValue(new Error('Collection not found'));

      await expect(service.getCollection(collectionId)).rejects.toThrow(NotFoundException);
    });
  });

  // The getAssetsInCollection method is quite complex and fetches data in batches
  // This is a simplified test that verifies basic functionality
  describe('getAssetsInCollection', () => {
    it('should get assets in a collection', async () => {
      const collectionId = '0.0.12345';
      const mockNFT = {
        tokenId: collectionId,
        serialNumber: '1',
        owner: '0.0.12345',
        metadata: { name: 'Test NFT' },
        creationTime: new Date(),
      };

      // Mock for the private fetchNFTBatch method by spying on getNFTInfo
      // We'll make it return one NFT and then throw 'NFT not found' to end the loop
      jest
        .spyOn(hederaService, 'getNFTInfo')
        .mockResolvedValueOnce(mockNFT)
        .mockRejectedValueOnce(new Error('NFT not found'));

      const result = await service.getAssetsInCollection(collectionId);

      expect(result).toEqual([mockNFT]);
      expect(result.length).toBe(1);
      expect(hederaService.getNFTInfo).toHaveBeenCalledWith(collectionId, '1');
    });
  });
});
