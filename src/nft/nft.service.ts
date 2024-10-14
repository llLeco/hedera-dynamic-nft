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
    const topicId = await this.hederaService.createTopic(`NFT Update Topic - ${collectionId}`);

    // Add topicId to the metadata
    const metadataWithTopic = {
      ...metadata,
      topicId: topicId,
    };

    // Create an immutable file with metadata including topicId
    const fileId = await this.hederaService.createImmutableFile(metadataWithTopic);

    // Convert metadata to base64 encoded JSON string
    const onChainMetadata = Buffer.from(JSON.stringify({fileId, topicId})).toString('base64');

    const serialNumber = await this.hederaService.mintNFT(collectionId, onChainMetadata);
    return `${collectionId}:${serialNumber}`;
  }

  async getNFTInfo(nftId: string): Promise<any> {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      throw new NotFoundException('Invalid NFT ID format');
    }

    const nftInfo = await this.hederaService.getNFTInfo(collectionId, serialNumber);
    
    console.log('Raw metadata:', nftInfo.metadata);

    return {
      ...nftInfo,
      metadata: nftInfo.metadata,
    };
  }

  async writeEvent(nftId: string, updateNFTDto: UpdateNFTDto): Promise<void> {
    const [collectionId, serialNumber] = nftId.split(':');
    if (!collectionId || !serialNumber) {
      throw new NotFoundException('Invalid NFT ID format');
    }

    const currentInfo = await this.getNFTInfo(nftId);
    const updatedMetadata = {
      ...currentInfo.metadata,
      ...updateNFTDto,
    };

    // Submit a message to the NFT's topic
    await this.hederaService.submitMessage(currentInfo.metadata.topicId, JSON.stringify({
      type: 'MetadataUpdate',
      nftId,
      updatedMetadata,
      timestamp: new Date().toISOString(),
    }));
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
