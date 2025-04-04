import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HederaService } from '../src/hedera/hedera.service';
import { IpfsService } from '../src/ipfs/ipfs.service';
import { mockHederaService, mockIpfsService } from './test-utils';

// Define a specific type for message responses to match the service implementation
interface MessageResponse {
  message: string;
}

describe('AppController (e2e)', () => {
  let app: any; // Use 'any' to avoid TypeScript conflicts between NestJS versions
  let hederaService: HederaService;
  let ipfsService: IpfsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HederaService)
      .useFactory({
        factory: () => mockHederaService(),
      })
      .overrideProvider(IpfsService)
      .useFactory({
        factory: () => mockIpfsService(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    hederaService = moduleFixture.get<HederaService>(HederaService);
    ipfsService = moduleFixture.get<IpfsService>(IpfsService);

    // Setup mock returns
    jest.spyOn(hederaService, 'createNFTCollection').mockResolvedValue('0.0.12345');
    jest.spyOn(hederaService, 'getCollectionInfo').mockResolvedValue({
      tokenId: '0.0.12345',
      name: 'Test Collection',
      symbol: 'TEST',
      totalSupply: '5',
      maxSupply: '1000',
    });
    jest.spyOn(hederaService, 'mintNFT').mockResolvedValue('1');
    jest.spyOn(hederaService, 'getNFTInfo').mockResolvedValue({
      tokenId: '0.0.12345',
      serialNumber: '1',
      owner: '0.0.12345',
      metadata: { name: 'Test NFT', description: 'A test NFT' },
      creationTime: new Date(),
    });
    jest.spyOn(hederaService, 'createTopic').mockResolvedValue('0.0.54321');

    // Use the correct type for messages
    const messages: MessageResponse[] = [
      { message: JSON.stringify({ type: 'update', data: 'test' }) },
    ];
    jest.spyOn(hederaService, 'getMessages').mockResolvedValue(messages);

    jest.spyOn(ipfsService, 'getImage').mockResolvedValue(Buffer.from('test image data'));
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('/ (GET) should return 404 for a non-existent route', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });

  describe('/collection', () => {
    it('POST /collection should create a new collection', () => {
      return request(app.getHttpServer())
        .post('/collection')
        .send({
          name: 'Test Collection',
          symbol: 'TEST',
          description: 'A test NFT collection',
        })
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body).toHaveProperty('name', 'Test Collection');
          expect(response.body).toHaveProperty('symbol', 'TEST');
          expect(response.body).toHaveProperty('description', 'A test NFT collection');
          expect(hederaService.createNFTCollection).toHaveBeenCalledWith('Test Collection', 'TEST');
        });
    });

    it('GET /collection/:collectionId should return collection information', () => {
      return request(app.getHttpServer())
        .get('/collection/0.0.12345')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('id', '0.0.12345');
          expect(response.body).toHaveProperty('name');
          expect(response.body).toHaveProperty('symbol');
          expect(response.body).toHaveProperty('description');
          expect(hederaService.getCollectionInfo).toHaveBeenCalledWith('0.0.12345');
        });
    });

    it('GET /collection/:collectionId/assets should return assets in a collection', () => {
      return request(app.getHttpServer())
        .get('/collection/0.0.12345/assets')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
        });
    });
  });

  describe('/nft', () => {
    it('POST /nft/:collectionId should create a new NFT', () => {
      return request(app.getHttpServer())
        .post('/nft/0.0.12345')
        .send({
          name: 'Test NFT',
          description: 'A test NFT',
          attributes: [{ trait_type: 'color', value: 'red' }],
          image: 'ipfs://QmTest123',
        })
        .expect(201)
        .then((response) => {
          expect(typeof response.body).toBe('string');
          expect(hederaService.createTopic).toHaveBeenCalled();
          expect(hederaService.mintNFT).toHaveBeenCalled();
        });
    });

    it('GET /nft/:nftId should return NFT information', () => {
      return request(app.getHttpServer())
        .get('/nft/0.0.12345:1')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty('tokenId', '0.0.12345');
          expect(response.body).toHaveProperty('serialNumber', '1');
          expect(response.body).toHaveProperty('metadata');
          expect(hederaService.getNFTInfo).toHaveBeenCalled();
        });
    });

    it('GET /nft/:nftId/history should return NFT history', () => {
      // Mock submitMessage for the test
      jest.spyOn(hederaService, 'submitMessage').mockResolvedValue('SUCCESS');

      return request(app.getHttpServer())
        .get('/nft/0.0.12345:1/history')
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(hederaService.getMessages).toHaveBeenCalled();
        });
    });

    it('POST /nft/:nftId/event should add an event to an NFT', () => {
      // Mock submitMessage for the test
      jest.spyOn(hederaService, 'submitMessage').mockResolvedValue('SUCCESS');

      return request(app.getHttpServer())
        .post('/nft/0.0.12345:1/event')
        .send({
          name: 'Test Event',
          description: 'Test event description',
        })
        .expect(201)
        .then(() => {
          expect(hederaService.submitMessage).toHaveBeenCalled();
        });
    });
  });

  describe('/ipfs', () => {
    it('GET /ipfs/:cid should return an image', () => {
      return request(app.getHttpServer())
        .get('/ipfs/QmTest123')
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(ipfsService.getImage).toHaveBeenCalledWith('QmTest123');
        });
    });
  });
});
