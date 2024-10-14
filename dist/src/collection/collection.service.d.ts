import { HederaService } from '../hedera/hedera.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
import { Collection } from '../models/collection.model';
export declare class CollectionService {
    private readonly hederaService;
    constructor(hederaService: HederaService);
    createCollection(createCollectionDto: CreateCollectionDto): Promise<Collection>;
    getCollection(collectionId: string): Promise<Collection>;
    getAssetsInCollection(collectionId: string): Promise<any[]>;
}
