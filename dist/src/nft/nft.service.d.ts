import { HederaService } from '../hedera/hedera.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
export declare class NFTService {
    private readonly hederaService;
    constructor(hederaService: HederaService);
    createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string>;
    getNFTInfo(nftId: string): Promise<any>;
    writeEvent(nftId: string, message: {
        name: string;
        description: string;
    }): Promise<void>;
    getNFTHistory(nftId: string): Promise<any[]>;
}
