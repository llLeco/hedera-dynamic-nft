import { HederaService } from '../hedera/hedera.service';
import { CreateNFTDto } from '../dto/create-nft.dto';
import { UpdateNFTDto } from '../dto/update-nft.dto';
export declare class NFTService {
    private readonly hederaService;
    constructor(hederaService: HederaService);
    createNFT(collectionId: string, createNFTDto: CreateNFTDto): Promise<string>;
    getNFTInfo(nftId: string): Promise<any>;
    writeEvent(nftId: string, updateNFTDto: UpdateNFTDto): Promise<void>;
    getNFTHistory(nftId: string): Promise<any[]>;
}
