export const mockHederaService = () => ({
  createNFTCollection: jest.fn(),
  mintNFT: jest.fn(),
  getNFTInfo: jest.fn(),
  createImmutableFile: jest.fn(),
  getFileContents: jest.fn(),
  createTopic: jest.fn(),
  submitMessage: jest.fn(),
  getMessages: jest.fn(),
  getCollectionInfo: jest.fn(),
});

export const mockIpfsService = () => ({
  uploadImage: jest.fn(),
  getImage: jest.fn(),
});

export const mockConfigService = () => ({
  get: jest.fn().mockImplementation((key: string) => {
    switch (key) {
      case 'HEDERA_ACCOUNT_ID':
        return '0.0.12345';
      case 'HEDERA_PRIVATE_KEY':
        return 'mock_private_key';
      case 'PINATA_API_KEY':
        return 'test-api-key';
      case 'PINATA_SECRET_KEY':
        return 'test-secret-key';
      case 'HEDERA_NETWORK':
        return 'testnet';
      default:
        return undefined;
    }
  }),
});

// Test fixtures for consistent test data
export const TEST_FIXTURES = {
  // Collection related fixtures
  COLLECTION: {
    ID: '0.0.12345',
    NAME: 'Test Collection',
    SYMBOL: 'TEST',
    DESCRIPTION: 'A test NFT collection',
    INFO: {
      tokenId: '0.0.12345',
      name: 'Test Collection',
      symbol: 'TEST',
      totalSupply: '5',
      maxSupply: '1000',
    },
  },

  // NFT related fixtures
  NFT: {
    ID: '0.0.12345:1',
    SERIAL_NUMBER: '1',
    NAME: 'Test NFT',
    DESCRIPTION: 'A test NFT',
    OWNER: '0.0.12345',
    TOPIC_ID: '0.0.54321',
    FILE_ID: '0.0.67890',
    CREATE_DTO: {
      name: 'Test NFT',
      description: 'A test NFT',
      attributes: [{ trait_type: 'color', value: 'red' }],
      image: 'ipfs://QmTest123',
    },
    INFO: {
      tokenId: '0.0.12345',
      serialNumber: '1',
      owner: '0.0.12345',
      metadata: {
        name: 'Test NFT',
        description: 'A test NFT',
        topicId: '0.0.54321',
      },
      creationTime: new Date('2023-01-01T00:00:00.000Z'),
    },
  },

  // Event related fixtures
  EVENT: {
    NAME: 'Test Event',
    DESCRIPTION: 'Event Description',
    DATA: {
      name: 'Test Event',
      description: 'Event Description',
    },
    HISTORY: [
      { name: 'Event 1', description: 'Description 1', timestamp: '2023-01-01T00:00:00.000Z' },
      { name: 'Event 2', description: 'Description 2', timestamp: '2023-01-02T00:00:00.000Z' },
    ],
    MESSAGES: [
      {
        message: JSON.stringify({
          name: 'Event 1',
          description: 'Description 1',
          timestamp: '2023-01-01T00:00:00.000Z',
        }),
      },
      {
        message: JSON.stringify({
          name: 'Event 2',
          description: 'Description 2',
          timestamp: '2023-01-02T00:00:00.000Z',
        }),
      },
    ],
  },

  // IPFS related fixtures
  IPFS: {
    CID: 'QmTest123',
    IMAGE_DATA: Buffer.from('test image data'),
  },
};
