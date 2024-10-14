"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const collection_service_1 = require("../src/collection/collection.service");
const config_1 = require("@nestjs/config");
const hedera_service_1 = require("../src/hedera/hedera.service");
const collection_model_1 = require("../src/models/collection.model");
describe('CollectionService', () => {
    let service;
    let hederaService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                collection_service_1.CollectionService,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
                            if (key === 'HEDERA_NETWORK')
                                return 'testnet';
                            return 'mock_value';
                        }),
                    },
                },
                {
                    provide: hedera_service_1.HederaService,
                    useValue: {
                        createNFTCollection: jest.fn(),
                        getCollectionInfo: jest.fn(),
                        getNFTInfo: jest.fn(),
                    },
                },
            ],
        }).compile();
        service = module.get(collection_service_1.CollectionService);
        hederaService = module.get(hedera_service_1.HederaService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    describe('createCollection', () => {
        it('should create a collection', async () => {
            const createCollectionDto = {
                name: 'Test Collection',
                symbol: 'TEST',
                description: 'A test collection',
            };
            const mockTokenId = '0.0.12345';
            jest.spyOn(hederaService, 'createNFTCollection').mockResolvedValue(mockTokenId);
            const result = await service.createCollection(createCollectionDto);
            expect(hederaService.createNFTCollection).toHaveBeenCalledWith(createCollectionDto.name, createCollectionDto.symbol);
            expect(result).toBeInstanceOf(collection_model_1.Collection);
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
            expect(result).toBeInstanceOf(collection_model_1.Collection);
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
//# sourceMappingURL=collection.service.spec.js.map