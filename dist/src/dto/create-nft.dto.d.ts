export declare class CreateNFTDto {
    name: string;
    description: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
    }>;
    image?: string;
}
