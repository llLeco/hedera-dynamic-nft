import { IpfsService } from './ipfs.service';
export declare class IpfsController {
    private readonly ipfsService;
    constructor(ipfsService: IpfsService);
    uploadImage(file: Express.Multer.File): Promise<{
        cid: string;
    }>;
    getImage(cid: string): Promise<Buffer>;
}
