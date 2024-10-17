import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class HederaService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private readonly logger;
    private client;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initializeClient;
    createNFTCollection(name: string, symbol: string): Promise<string>;
    mintNFT(collectionId: string, fileId: string): Promise<string>;
    createImmutableFile(content: any): Promise<string>;
    getFileContents(fileId: string): Promise<any>;
    getCollectionInfo(tokenId: string): Promise<any>;
    getNFTInfo(tokenId: string, serialNumber: string): Promise<any>;
    private tryParseJSON;
    createTopic(memo: string): Promise<string>;
    submitMessage(topicId: string, message: string): Promise<string>;
    getMessages(topicId: string, startTime: Date, messageCount: number, timeout: number): Promise<Array<{
        message: string;
    }>>;
}
