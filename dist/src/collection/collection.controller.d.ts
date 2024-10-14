import { CollectionService } from './collection.service';
import { CreateCollectionDto } from '../dto/create-collection.dto';
export declare class CollectionController {
    private readonly collectionService;
    constructor(collectionService: CollectionService);
    createCollection(createCollectionDto: CreateCollectionDto): Promise<import("../models/collection.model").Collection>;
    getCollection(collectionId: string): Promise<import("../models/collection.model").Collection>;
    getAssetsInCollection(collectionId: string): Promise<any[]>;
}
