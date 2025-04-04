import { Test, TestingModule } from '@nestjs/testing';
import { NFTService } from '../../src/nft/nft.service';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../../src/hedera/hedera.service';
import { TEST_FIXTURES } from '../test-utils';

describe('NFT Service Snapshots', () => {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('NFT Metadata Format', () => {
    it('should match snapshot for NFT metadata format', async () => {
      // Arrange
      const { NFT } = TEST_FIXTURES;

      // Setup spy to return fixed NFT info
      jest.spyOn(hederaService, 'getNFTInfo').mockResolvedValue({
        ...NFT.INFO,
        // Ensure date is fixed for snapshot testing
        creationTime: new Date('2023-01-01T00:00:00Z'),
      });

      // Act
      const result = await service.getNFTInfo(NFT.ID);

      // Assert - verify the result matches the expected format
      expect(result).toMatchSnapshot();
    });
  });

  describe('NFT Event Format', () => {
    it('should match snapshot for event format', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;
      const fixedDate = new Date('2023-01-01T00:00:00Z');

      // Mock data with fixed timestamps for snapshot testing
      const fixedMessages = [
        {
          message: JSON.stringify({
            name: 'Event 1',
            description: 'Description 1',
            timestamp: fixedDate.toISOString(),
          }),
        },
        {
          message: JSON.stringify({
            name: 'Event 2',
            description: 'Description 2',
            timestamp: new Date('2023-01-02T00:00:00Z').toISOString(),
          }),
        },
      ];

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      jest.spyOn(hederaService, 'getMessages').mockResolvedValue(fixedMessages);

      // Act
      const result = await service.getNFTHistory(NFT.ID);

      // Assert - verify the history format matches the expected structure
      expect(result).toMatchSnapshot();
    });
  });

  describe('NFT Creation Payload', () => {
    it('should create consistent metadata payload for Hedera', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;

      // Spy on createImmutableFile to capture the exact payload
      const createFileSpy = jest
        .spyOn(hederaService, 'createImmutableFile')
        .mockResolvedValue(NFT.FILE_ID);

      // Mock dependencies
      jest.spyOn(hederaService, 'createTopic').mockResolvedValue(NFT.TOPIC_ID);
      jest.spyOn(hederaService, 'mintNFT').mockResolvedValue(NFT.SERIAL_NUMBER);

      // Act
      await service.createNFT(COLLECTION.ID, NFT.CREATE_DTO);

      // Assert
      expect(createFileSpy).toHaveBeenCalled();

      // Extract the exact payload sent to createImmutableFile
      const payload = createFileSpy.mock.calls[0][0];

      // Parse the JSON to verify structure (it's a string in the actual call)
      const parsedPayload = JSON.parse(payload);

      // Remove dynamic elements that would change between test runs
      delete parsedPayload.created_at;

      // Check against snapshot for consistent format
      expect(parsedPayload).toMatchSnapshot();
    });
  });
});
