import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class IpfsService {
  private readonly logger = new Logger(IpfsService.name);
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataBaseUrl = 'https://api.pinata.cloud';

  constructor(private configService: ConfigService) {
    this.pinataApiKey = this.configService.get<string>('PINATA_API_KEY');
    this.pinataSecretKey = this.configService.get<string>('PINATA_SECRET_KEY');

    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata API credentials not found in environment variables');
    }
  }

  async uploadImage(imageBuffer: Buffer): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer]));

      const response = await axios.post(`${this.pinataBaseUrl}/pinning/pinFileToIPFS`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          pinata_api_key: this.pinataApiKey,
          pinata_secret_api_key: this.pinataSecretKey,
        },
      });

      return response.data.IpfsHash;
    } catch (error) {
      this.logger.error('Failed to upload image to Pinata:', error);
      throw error;
    }
  }

  async getImage(cid: string): Promise<Buffer> {
    try {
      const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Failed to retrieve image from Pinata:', error);
      throw error;
    }
  }
}
