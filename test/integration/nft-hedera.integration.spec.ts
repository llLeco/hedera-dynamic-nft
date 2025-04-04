import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NFTService } from '../../src/nft/nft.service';
import { HederaService } from '../../src/hedera/hedera.service';
import { TEST_FIXTURES } from '../test-utils';
import { CreateNFTDto } from '../../src/dto/create-nft.dto';

describe('NFT-Hedera Service Integration', () => {
  let nftService: NFTService;
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
        HederaService,
      ],
    })
      .overrideProvider(HederaService)
      .useValue({
        createNFTCollection: jest.fn(),
        mintNFT: jest.fn(),
        getNFTInfo: jest.fn(),
        createImmutableFile: jest.fn(),
        getFileContents: jest.fn(),
        createTopic: jest.fn(),
        submitMessage: jest.fn(),
        getMessages: jest.fn(),
      })
      .compile();

    nftService = module.get<NFTService>(NFTService);
    hederaService = module.get<HederaService>(HederaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('NFT Creation Flow', () => {
    it('should create an NFT using Hedera service', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;
      const createNFTDto: CreateNFTDto = NFT.CREATE_DTO;

      // Setup spy chains to track the order of calls
      const createTopicSpy = jest
        .spyOn(hederaService, 'createTopic')
        .mockResolvedValue(NFT.TOPIC_ID);

      const createFileSpy = jest
        .spyOn(hederaService, 'createImmutableFile')
        .mockResolvedValue(NFT.FILE_ID);

      const mintNFTSpy = jest.spyOn(hederaService, 'mintNFT').mockResolvedValue(NFT.SERIAL_NUMBER);

      // Act
      const result = await nftService.createNFT(COLLECTION.ID, createNFTDto);

      // Assert
      expect(createTopicSpy).toHaveBeenCalledTimes(1);
      expect(createFileSpy).toHaveBeenCalledTimes(1);
      expect(mintNFTSpy).toHaveBeenCalledTimes(1);

      // Verify order of calls
      expect(createTopicSpy.mock.invocationCallOrder[0]).toBeLessThan(
        createFileSpy.mock.invocationCallOrder[0],
      );

      expect(createFileSpy.mock.invocationCallOrder[0]).toBeLessThan(
        mintNFTSpy.mock.invocationCallOrder[0],
      );

      // Verify file content contains topic ID
      expect(createFileSpy).toHaveBeenCalledWith(expect.stringContaining(NFT.TOPIC_ID));

      // Verify mint call with correct collection and file ID
      expect(mintNFTSpy).toHaveBeenCalledWith(COLLECTION.ID, NFT.FILE_ID);

      // Verify expected result
      expect(result).toBe(`${COLLECTION.ID}:${NFT.SERIAL_NUMBER}`);
    });
  });

  describe('NFT History Flow', () => {
    it('should retrieve NFT info and then get message history', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Setup spy chain
      const getNFTInfoSpy = jest.spyOn(nftService, 'getNFTInfo').mockResolvedValue(NFT.INFO);

      const getMessagesSpy = jest
        .spyOn(hederaService, 'getMessages')
        .mockResolvedValue(EVENT.MESSAGES);

      // Act
      const result = await nftService.getNFTHistory(NFT.ID);

      // Assert
      expect(getNFTInfoSpy).toHaveBeenCalledTimes(1);
      expect(getMessagesSpy).toHaveBeenCalledTimes(1);

      // Verify order of calls
      expect(getNFTInfoSpy.mock.invocationCallOrder[0]).toBeLessThan(
        getMessagesSpy.mock.invocationCallOrder[0],
      );

      // Verify messages are properly parsed
      expect(result).toHaveLength(EVENT.HISTORY.length);
      expect(result[0]).toHaveProperty('name', EVENT.HISTORY[0].name);
    });
  });

  describe('NFT Event Writing Flow', () => {
    it('should get NFT info and then submit a message to the topic', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Setup spy chain
      const getNFTInfoSpy = jest.spyOn(nftService, 'getNFTInfo').mockResolvedValue(NFT.INFO);

      const submitMessageSpy = jest
        .spyOn(hederaService, 'submitMessage')
        .mockResolvedValue('SUCCESS');

      // Act
      await nftService.writeEvent(NFT.ID, EVENT.DATA);

      // Assert
      expect(getNFTInfoSpy).toHaveBeenCalledTimes(1);
      expect(submitMessageSpy).toHaveBeenCalledTimes(1);

      // Verify order of calls
      expect(getNFTInfoSpy.mock.invocationCallOrder[0]).toBeLessThan(
        submitMessageSpy.mock.invocationCallOrder[0],
      );

      // Verify message content
      expect(submitMessageSpy).toHaveBeenCalledWith(
        NFT.INFO.metadata.topicId,
        expect.stringContaining(EVENT.NAME),
      );
    });
  });
});
