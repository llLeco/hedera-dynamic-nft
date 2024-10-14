export class NFT {
    id: string;
    name: string;
    description: string;
    attributes: Record<string, string | number>;
    image?: string;
    owner: string;
    createdAt: Date;
  
    constructor(partial: Partial<NFT>) {
      Object.assign(this, partial);
    }
  }