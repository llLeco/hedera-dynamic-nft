import { Injectable, NotFoundException } from '@nestjs/common';
import { HederaService } from '../hedera/hedera.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
import { UpdateNFTDto } from '../dto/update-nft.dto';

@Injectable()
export class NFTService {
  constructor(private readonly hederaService: HederaService) {}

  async createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string> {
    const metadata = {
      name: createNFTDto.name,
      description: createNFTDto.description,
      attributes: createNFTDto.attributes,
      image: createNFTDto.image,
    };

    // Create a topic for this NFT
    const topicId = await this.hederaService.createTopic(`NFT Topic - ${collectionId}`);

    // Add topicId to the metadata
    const metadataWithTopic = {
      ...metadata,
      topicId: topicId,
    };

    // Create an immutable file with metadata including topicId
    const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);

    const serialNumber = await this.hederaService.mintNFT(collectionId, fileId);
    return `${collectionId}:${serialNumber}`;
  }

  async getNFTInfo(nftId: string): Promise<any> {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      throw new NotFoundException('Invalid NFT ID format');
    }

    const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
    
    console.log('NFT Info:', nftInfo);

    return nftInfo;
  }

  async writeEvent(nftId: string, message: {name: string, description: string}): Promise<void> {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      throw new NotFoundException('Invalid NFT ID format');
    }

    console.log('Writing event to NFT:', nftId);
    console.log('Message:', message);

    const currentInfo = await this.getNFTInfo(nftId);

    //add timestamp to message
    const messageWithTimestamp = {
      name: message.name,
      description: message.description,
      timestamp: new Date().toISOString(),
    };

    // Submit a message to the NFT's topic
    await this.hederaService.submitMessage(currentInfo.metadata.topicId, JSON.stringify(messageWithTimestamp));
  }

  async getNFTHistory(nftId: string): Promise<any[]> {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      throw new NotFoundException('Invalid NFT ID format');
    }

    const eventTopic = `NFT Update Event - ${nftId}`;
    const startTime = new Date(0); // Start from the beginning of time
    const messages = await this.hederaService.getMessages(eventTopic, startTime, 100, 10000);

    return messages.map(msg => msg.message);
  }
}
