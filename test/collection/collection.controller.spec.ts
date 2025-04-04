import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from '../../src/collection/collection.controller';
import { CollectionService } from '../../src/collection/collection.service';
import { CreateCollectionDto } from '../../src/dto/create-collection.dto';
import { Collection } from '../../src/models/collection.model';
import { NotFoundException } from '@nestjs/common';

describe('CollectionController', () => {
  let controller: CollectionController;
  let collectionService: CollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: {
            createCollection: jest.fn(),
            getCollection: jest.fn(),
            getAssetsInCollection: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
    collectionService = module.get<CollectionService>(CollectionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const createCollectionDto: CreateCollectionDto = {
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test NFT collection',
      };

      const mockCollection = new Collection({
        id: '0.0.12345',
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test NFT collection',
        createdAt: new Date(),
      });

      jest.spyOn(collectionService, 'createCollection').mockResolvedValue(mockCollection);

      const result = await controller.createCollection(createCollectionDto);

      expect(collectionService.createCollection).toHaveBeenCalledWith(createCollectionDto);
      expect(result).toEqual(mockCollection);
    });
  });

  describe('getCollection', () => {
    it('should return collection information', async () => {
      const collectionId = '0.0.12345';
      const mockCollection = new Collection({
        id: collectionId,
        name: 'Test Collection',
        symbol: 'TEST',
        description: 'A test NFT collection',
        createdAt: new Date(),
      });

      jest.spyOn(collectionService, 'getCollection').mockResolvedValue(mockCollection);

      const result = await controller.getCollection(collectionId);

      expect(collectionService.getCollection).toHaveBeenCalledWith(collectionId);
      expect(result).toEqual(mockCollection);
    });

    it('should throw NotFoundException when collection is not found', async () => {
      const collectionId = '0.0.99999';

      jest
        .spyOn(collectionService, 'getCollection')
        .mockRejectedValue(new NotFoundException('Collection not found'));

      await expect(controller.getCollection(collectionId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAssetsInCollection', () => {
    it('should return assets in a collection', async () => {
      const collectionId = '0.0.12345';
      const assets = [
        { tokenId: '0.0.12345', serialNumber: '1', metadata: { name: 'NFT 1' } },
        { tokenId: '0.0.12345', serialNumber: '2', metadata: { name: 'NFT 2' } },
      ];

      jest.spyOn(collectionService, 'getAssetsInCollection').mockResolvedValue(assets);

      const result = await controller.getAssetsInCollection(collectionId);

      expect(collectionService.getAssetsInCollection).toHaveBeenCalledWith(collectionId);
      expect(result).toEqual(assets);
    });

    it('should return empty array when no assets found', async () => {
      const collectionId = '0.0.12345';

      jest.spyOn(collectionService, 'getAssetsInCollection').mockResolvedValue([]);

      const result = await controller.getAssetsInCollection(collectionId);

      expect(collectionService.getAssetsInCollection).toHaveBeenCalledWith(collectionId);
      expect(result).toEqual([]);
    });
  });
});
