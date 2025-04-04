import { Test, TestingModule } from '@nestjs/testing';
import { NFTService } from '../../src/nft/nft.service';
import { ConfigService } from '@nestjs/config';
import { HederaService } from '../../src/hedera/hedera.service';
import { TEST_FIXTURES } from '../test-utils';
import { performance } from 'perf_hooks';

describe('NFT Service Performance', () => {
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

  // Function to measure execution time of an async function
  const measureExecutionTime = async (fn: () => Promise<any>): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    return end - start;
  };

  describe('NFT Creation Performance', () => {
    it('should create NFTs within acceptable time limits', async () => {
      // Arrange
      const { COLLECTION, NFT } = TEST_FIXTURES;

      // Setup mocks with minimal delay to simulate realistic timing
      jest.spyOn(hederaService, 'createTopic').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return NFT.TOPIC_ID;
      });

      jest.spyOn(hederaService, 'createImmutableFile').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return NFT.FILE_ID;
      });

      jest.spyOn(hederaService, 'mintNFT').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return NFT.SERIAL_NUMBER;
      });

      // Act - measure 10 consecutive NFT creations
      const executionTimes: number[] = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const time = await measureExecutionTime(async () => {
          await service.createNFT(COLLECTION.ID, NFT.CREATE_DTO);
        });
        executionTimes.push(time);
      }

      // Assert
      const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / iterations;
      console.log(`Average NFT creation time: ${avgExecutionTime.toFixed(2)}ms`);

      // Verify each creation is within acceptable limits (adjust as needed)
      const maxAcceptableTime = 100; // 100ms is our performance target
      executionTimes.forEach((time, index) => {
        expect(time).toBeLessThan(maxAcceptableTime);
      });

      // Verify number of calls matches expectations
      expect(hederaService.createTopic).toHaveBeenCalledTimes(iterations);
      expect(hederaService.createImmutableFile).toHaveBeenCalledTimes(iterations);
      expect(hederaService.mintNFT).toHaveBeenCalledTimes(iterations);
    });
  });

  describe('NFT History Retrieval Performance', () => {
    it('should retrieve NFT history within acceptable time limits', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Create large history to test with
      const generateLargeHistory = (count: number) => {
        return Array.from({ length: count }, (_, i) => ({
          message: JSON.stringify({
            name: `Event ${i}`,
            description: `Description ${i}`,
            timestamp: new Date().toISOString(),
          }),
        }));
      };

      const smallHistory = EVENT.MESSAGES;
      const mediumHistory = generateLargeHistory(50);
      const largeHistory = generateLargeHistory(100);

      // Setup spies
      jest.spyOn(service, 'getNFTInfo').mockResolvedValue(NFT.INFO);
      const getMessagesSpy = jest.spyOn(hederaService, 'getMessages');

      // Test with varying history sizes
      const testHistorySize = async (history: any[], label: string) => {
        getMessagesSpy.mockResolvedValue(history);

        const time = await measureExecutionTime(async () => {
          await service.getNFTHistory(NFT.ID);
        });

        console.log(
          `${label} history (${history.length} items) retrieval time: ${time.toFixed(2)}ms`,
        );
        return time;
      };

      // Act & Assert
      const smallTime = await testHistorySize(smallHistory, 'Small');
      const mediumTime = await testHistorySize(mediumHistory, 'Medium');
      const largeTime = await testHistorySize(largeHistory, 'Large');

      // Verify performance scales reasonably with size
      expect(smallTime).toBeLessThan(50);
      expect(mediumTime).toBeLessThan(100);
      expect(largeTime).toBeLessThan(200);

      // Check if time increases are proportional to data size increases
      const smallToMediumRatio = mediumTime / smallTime;
      const mediumToLargeRatio = largeTime / mediumTime;

      // Ratio should be less than linear (O(n)) for good scaling
      expect(smallToMediumRatio).toBeLessThan(mediumHistory.length / smallHistory.length);
      expect(mediumToLargeRatio).toBeLessThan(largeHistory.length / mediumHistory.length);
    });
  });

  describe('Event Writing Performance', () => {
    it('should write events within acceptable time limits', async () => {
      // Arrange
      const { NFT, EVENT } = TEST_FIXTURES;

      // Setup spies with realistic timing
      jest.spyOn(service, 'getNFTInfo').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return NFT.INFO;
      });

      jest.spyOn(hederaService, 'submitMessage').mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'SUCCESS';
      });

      // Act - measure consecutive event writes
      const executionTimes: number[] = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        const customEvent = {
          name: `Test Event ${i}`,
          description: `Event Description ${i}`,
        };

        const time = await measureExecutionTime(async () => {
          await service.writeEvent(NFT.ID, customEvent);
        });
        executionTimes.push(time);
      }

      // Assert
      const avgExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / iterations;
      console.log(`Average event writing time: ${avgExecutionTime.toFixed(2)}ms`);

      // Verify performance is within acceptable limits
      executionTimes.forEach((time) => {
        expect(time).toBeLessThan(50); // 50ms is our performance target
      });
    });
  });
});
