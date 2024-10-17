import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
import { UpdateNFTDto } from '../dto/update-nft.dto';

@Injectable()
export class NFTService {
  private readonly logger = new Logger(NFTService.name);

  constructor(private readonly hederaService: HederaService) {}

  /**
   * Creates a new NFT in the specified collection.
   * @param collectionId The ID of the collection to mint the NFT in.
   * @param createNFTDto The DTO containing NFT creation details.
   * @returns A promise that resolves to the newly created NFT ID.
   */
  async createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string> {
    this.logger.log(`Creating NFT in collection: ${collectionId}`);

    const metadata = {
      name: createNFTDto.name,
      description: createNFTDto.description,
      attributes: createNFTDto.attributes,
      image: createNFTDto.image,
    };

    try {
      const topicId = await this.hederaService.createTopic(`NFT Topic - ${collectionId}`);
      const metadataWithTopic = { ...metadata, topicId };
      const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);
      const serialNumber = await this.hederaService.mintNFT(collectionId, fileId);
      
      const nftId = `${collectionId}:${serialNumber}`;
      this.logger.log(`NFT created successfully: ${nftId}`);
      return nftId;
    } catch (error) {
      this.logger.error(`Error creating NFT: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves information about a specific NFT.
   * @param nftId The ID of the NFT to retrieve information for.
   * @returns A promise that resolves to the NFT information.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async getNFTInfo(nftId: string): Promise<any> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);
    
    try {
      const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
      this.logger.log(`Retrieved info for NFT: ${nftId}`);
      
      // If metadata is a string, try to parse it as JSON
      if (typeof nftInfo.metadata === 'string') {
        try {
          nftInfo.metadata = JSON.parse(nftInfo.metadata);
        } catch (error) {
          this.logger.warn(`Failed to parse metadata as JSON for NFT ${nftId}`);
        }
      }
      
      return nftInfo;
    } catch (error) {
      this.logger.error(`Error retrieving NFT info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Writes an event to the NFT's associated topic.
   * @param nftId The ID of the NFT to write the event for.
   * @param message The event message to write.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async writeEvent(nftId: string, message: {name: string, description: string}): Promise<void> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);

    this.logger.log(`Writing event to NFT: ${nftId}`);
    this.logger.debug('Event message:', message);

    try {
      const currentInfo = await this.getNFTInfo(nftId);
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString(),
      };

      await this.hederaService.submitMessage(currentInfo.metadata.topicId, JSON.stringify(messageWithTimestamp));
      this.logger.log(`Event written successfully to NFT: ${nftId}`);
    } catch (error) {
      this.logger.error(`Error writing event to NFT: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Retrieves the history of events for a specific NFT.
   * @param nftId The ID of the NFT to retrieve history for.
   * @returns A promise that resolves to an array of historical events.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  async getNFTHistory(nftId: string): Promise<any[]> {
    const [collectionId, serialNumber] = this.parseNftId(nftId);

    this.logger.log(`Retrieving history for NFT: ${nftId}`);

    try {
      const currentInfo = await this.getNFTInfo(nftId);
      const startTime = new Date(0); // Start from the beginning of time
      const messages = await this.hederaService.getMessages(currentInfo.metadata.topicId, startTime, 100, 10000);

      this.logger.log(`Retrieved ${messages.length} historical events for NFT: ${nftId}`);
      return messages.map(msg => msg.message);
    } catch (error) {
      this.logger.error(`Error retrieving NFT history: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parses an NFT ID into its collection ID and serial number components.
   * @param nftId The NFT ID to parse.
   * @returns An array containing the collection ID and serial number.
   * @throws NotFoundException if the NFT ID format is invalid.
   */
  private parseNftId(nftId: string): [string, string] {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      this.logger.error(`Invalid NFT ID format: ${nftId}`);
      throw new NotFoundException('Invalid NFT ID format');
    }
    return [collectionId, serialNumber];
  }
}
