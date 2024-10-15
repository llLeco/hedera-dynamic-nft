import { NFTService } from './nft.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
export declare class NFTController {
    private readonly nftService;
    constructor(nftService: NFTService);
    createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string>;
    getNFTInfo(nftId: string): Promise<any>;
    getNFTHistory(nftId: string): Promise<any[]>;
    writeEvent(nftId: string, message: {
        name: string;
        description: string;
    }): Promise<void>;
}
