import { Test, TestingModule } from '@nestjs/testing';

import { Test, TestingModule } from '@nestjs/testing';
import { NFTService } from '../src/nft/nft.service';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../src/hedera/hedera.service';
import { CreateNFTDto } from '../src/dto/create-nft.dto';
import { UpdateNFTDto } from '../src/dto/update-nft.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TEST_FIXTURES } from './test-utils';

describe('NFTService', () => {
  let service: NFTService;
  let hederaService: HederaService;
  let configService: ConfigService;

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
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNFT', () => {
    it('should create an NFT successfully', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;

      // Setup our mocks with proper return values
      jest.spyOn(hederaService, 'createTopic').mockResolvedValue(NFT.TOPIC_ID);
      jest.spyOn(hederaService, 'createImmutableFile').mockResolvedValue(NFT.FILE_ID);
      jest.spyOn(hederaService, 'mintNFT').mockResolvedValue(NFT.SERIAL_NUMBER);

      // Act
      const result = await service.createNFT(COLLECTION.ID, NFT.CREATE_DTO);

      // Assert
      expect(hederaService.createTopic).toHaveBeenCalled();
      expect(hederaService.createImmutableFile).toHaveBeenCalled();
      expect(hederaService.mintNFT).toHaveBeenCalledWith(COLLECTION.ID, NFT.FILE_ID);
      expect(result).toBe(`${COLLECTION.ID}:${NFT.SERIAL_NUMBER}`);
    });

    it('should handle createTopic failure gracefully', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;

      // Setup mock to throw error
      jest
        .spyOn(hederaService, 'createTopic')
        .mockRejectedValue(new Error('Topic creation failed'));

      // Act & Assert
      await expect(service.createNFT(COLLECTION.ID, NFT.CREATE_DTO)).rejects.toThrow(
        'Failed to create NFT: Topic creation failed',
      );
    });

    it('should handle mintNFT failure gracefully', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;

      // Setup mocks
      jest.spyOn(hederaService, 'createTopic').mockResolvedValue(NFT.TOPIC_ID);
      jest.spyOn(hederaService, 'createImmutableFile').mockResolvedValue(NFT.FILE_ID);
      jest.spyOn(hederaService, 'mintNFT').mockRejectedValue(new Error('Mint failed'));

      // Act & Assert
      await expect(service.createNFT(COLLECTION.ID, NFT.CREATE_DTO)).rejects.toThrow(
        'Failed to create NFT: Mint failed',
      );
    });

    it('should reject with invalid collection ID', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;
      const invalidCollectionId = 'invalid-id';

      // Act & Assert
      await expect(service.createNFT(invalidCollectionId, NFT.CREATE_DTO)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getNFTInfo', () => {
    it('should get NFT info successfully', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;

      // Setup mock
      jest.spyOn(hederaService, 'getNFTInfo').mockResolvedValue(NFT.INFO);

      // Act
      const result = await service.getNFTInfo(NFT.ID);

      // Assert
      expect(hederaService.getNFTInfo).toHaveBeenCalledWith(NFT.INFO.tokenId, NFT.SERIAL_NUMBER);
      expect(result).toEqual(NFT.INFO);
    });

    it('should throw NotFoundException for invalid NFT ID format', async () => {
      // Arrange
      const invalidNFTId = 'invalid-id';

      // Act & Assert
      await expect(service.getNFTInfo(invalidNFTId)).rejects.toThrow(NotFoundException);
    });

    it('should handle NFT not found error', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;

      // Setup mock to throw error
      jest.spyOn(hederaService, 'getNFTInfo').mockRejectedValue(new Error('NFT not found'));

      // Act & Assert
      await expect(service.getNFTInfo(NFT.ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('writeEvent', () => {
    it('should write an event to NFT metadata successfully', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Mock the NFT info with a topic ID
      // Setup spy on methods
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest.spyOn(hederaService, 'submitMessage').mockResolvedValue('SUCCESS');

      // Act
      await service.writeEvent(NFT.ID, EVENT.DATA);

      // Assert
      expect(service.getNFTInfo).toHaveBeenCalledWith(NFT.ID);
      expect(hederaService.submitMessage).toHaveBeenCalledWith(
        NFT.INFO.metadata.topicId,
        expect.stringContaining(EVENT.NAME),
      );
    });

    it('should throw error if NFT has no topic ID', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;
      const nftInfoWithoutTopic = {
        ...NFT.INFO,
        metadata: { name: 'Test NFT', description: 'A test NFT' }, // No topicId
      };

      // Setup spy on methods
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(nftInfoWithoutTopic);

      // Act & Assert
      await expect(service.writeEvent(NFT.ID, EVENT.DATA)).rejects.toThrow(
        'NFT does not have a topic ID',
      );
    });

    it('should handle error in submitMessage', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest
        .spyOn(hederaService, 'submitMessage')
        .mockRejectedValue(new Error('Message submission failed'));

      // Act & Assert
      await expect(service.writeEvent(NFT.ID, EVENT.DATA)).rejects.toThrow(
        'Failed to write event: Message submission failed',
      );
    });
  });

  describe('getNFTHistory', () => {
    it('should get NFT history successfully', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest.spyOn(hederaService, 'getMessages').mockResolvedValue(EVENT.MESSAGES);

      // Act
      const result = await service.getNFTHistory(NFT.ID);

      // Assert
      expect(service.getNFTInfo).toHaveBeenCalledWith(NFT.ID);
      expect(hederaService.getMessages).toHaveBeenCalledWith(
        NFT.INFO.metadata.topicId,
        expect.any(Date),
        100,
        10000,
      );
      expect(result.length).toBe(EVENT.HISTORY.length);
    });

    it('should throw NotFoundException for invalid NFT ID', async () => {
      // Arrange
      const invalidNFTId = 'invalid-id';

      // Act & Assert
      await expect(service.getNFTHistory(invalidNFTId)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if NFT has no topic ID', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;
      const nftInfoWithoutTopic = {
        ...NFT.INFO,
        metadata: { name: 'Test NFT', description: 'A test NFT' }, // No topicId
      };

      // Setup spy
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(nftInfoWithoutTopic);

      // Act & Assert
      await expect(service.getNFTHistory(NFT.ID)).rejects.toThrow('NFT does not have a topic ID');
    });

    it('should handle invalid JSON in message', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;
      const messagesWithInvalidJSON = [
        { message: '{ invalid JSON' },
        { message: JSON.stringify({ name: 'Valid Event', timestamp: new Date().toISOString() }) },
      ];

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest.spyOn(hederaService, 'getMessages').mockResolvedValue(messagesWithInvalidJSON);

      // Act
      const result = await service.getNFTHistory(NFT.ID);

      // Assert
      expect(result.length).toBe(1); // Only the valid message should be included
    });

    it('should return empty array when no messages', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest.spyOn(hederaService, 'getMessages').mockResolvedValue([]);

      // Act
      const result = await service.getNFTHistory(NFT.ID);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
