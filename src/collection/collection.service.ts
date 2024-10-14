import { Injectable } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { Collection } from '../models/collection.model';

@Injectable()
export class CollectionService {
  constructor(private readonly hederaService: HederaService) {}

  async createCollection(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const { name, symbol, description } = createCollectionDto;
    const tokenId = await this.hederaService.createNFTCollection(name, symbol);
    
    return new Collection({
      id: tokenId,
      name,
      symbol,
      description,
      createdAt: new Date()
    });
  }

  async getCollection(collectionId: string): Promise<Collection> {
    const info = await this.hederaService.getCollectionInfo(collectionId);
    return new Collection({
      id: collectionId,
      name: info.name,
      symbol: info.symbol,
      description: 'Description not available', // Hedera doesn't provide description in TokenInfo
      createdAt: new Date() // Using current date as Hedera doesn't provide creation date
    });
  }

  async getAssetsInCollection(collectionId: string): Promise<any[]> {
    const nfts: any[] = [];
    for (let i = 1; i <= 100; i++) {
      try {
        const nftInfo = await this.hederaService.getNFTInfo(collectionId, i.toString());
        nfts.push(nftInfo);
      } catch (error) {
        // If we get a "not found" error, we've reached the end of the minted NFTs
        if (error.message === 'NFT not found') {
          break;
        }
        throw error;
      }
    }
    return nfts;
  }
}
