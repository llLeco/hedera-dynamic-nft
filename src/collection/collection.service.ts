import { Injectable, NotFoundException } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { Collection } from '../models/collection.model';

@Injectable()
export class CollectionService {
  constructor(private readonly hederaService: HederaService) {}

  /**
   * Creates a new NFT collection on the Hedera network.
   *
   * @param createCollectionDto - The DTO containing the collection details (name, symbol, description).
   * @returns A Promise that resolves to a new Collection object.
   * @throws {Error} If there's an issue creating the collection on the Hedera network.
   */
  async createCollection(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const { name, symbol, description } = createCollectionDto;

    // Create the NFT collection on Hedera and get the token ID
    const tokenId = await this.hederaService.createNFTCollection(name, symbol);

    // Create and return a new Collection object with the provided details and token ID
    return new Collection({
      id: tokenId,
      name,
      symbol,
      description,
      createdAt: new Date(),
    });
  }

  /**
   * Retrieves information about a specific NFT collection from the Hedera network.
   *
   * @param collectionId - The unique identifier of the collection to retrieve.
   * @returns A Promise that resolves to a Collection object containing the collection details.
   * @throws {NotFoundException} If the collection with the given ID is not found on the Hedera network.
   */
  async getCollection(collectionId: string): Promise<Collection> {
    try {
      // Fetch the collection information from Hedera
      const info = await this.hederaService.getCollectionInfo(collectionId);

      // Create and return a Collection object with the retrieved information
      return new Collection({
        id: collectionId,
        name: info.name,
        symbol: info.symbol,
        description: 'Description not available', // Hedera doesn't provide description in TokenInfo
        createdAt: new Date(), // Using current date as Hedera doesn't provide creation date
      });
    } catch (error) {
      // If the collection is not found, throw a NotFoundException
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }
  }

  /**
   * Retrieves all NFT assets within a specific collection from the Hedera network.
   * This method uses batch processing to efficiently fetch large collections.
   *
   * @param collectionId - The unique identifier of the collection to retrieve assets from.
   * @returns A Promise that resolves to an array of NFT information objects.
   */
  async getAssetsInCollection(collectionId: string): Promise<any[]> {
    const nfts: any[] = [];
    const batchSize = 20; // Number of NFTs to fetch in each batch
    let currentBatch = 1;

    while (true) {
      // Fetch a batch of NFTs
      const batchNFTs = await this.fetchNFTBatch(collectionId, currentBatch, batchSize);

      // If the batch is empty, we've fetched all NFTs
      if (batchNFTs.length === 0) break;

      // Add the fetched NFTs to the result array
      nfts.push(...batchNFTs);

      // Move to the next batch
      currentBatch++;
    }

    return nfts;
  }

  /**
   * Fetches a batch of NFTs from a specific collection.
   * This private method is used by getAssetsInCollection for batch processing.
   *
   * @param collectionId - The unique identifier of the collection.
   * @param batch - The current batch number.
   * @param batchSize - The number of NFTs to fetch in this batch.
   * @returns A Promise that resolves to an array of NFT information objects for the current batch.
   * @throws {Error} If there's an issue fetching NFT information, except for 'NFT not found' errors.
   */
  private async fetchNFTBatch(
    collectionId: string,
    batch: number,
    batchSize: number,
  ): Promise<any[]> {
    const batchNFTs: any[] = [];
    for (let i = (batch - 1) * batchSize + 1; i <= batch * batchSize; i++) {
      try {
        // Attempt to fetch information for the current NFT
        const nftInfo = await this.hederaService.getNFTInfo(collectionId, i.toString());
        batchNFTs.push(nftInfo);
      } catch (error) {
        // If the NFT is not found, we've reached the end of the collection
        if (error.message === 'NFT not found') break;
        // For any other error, throw it to be handled by the caller
        throw error;
      }
    }
    return batchNFTs;
  }
}
