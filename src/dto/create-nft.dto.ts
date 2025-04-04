import { IsString, IsArray, IsOptional, Matches } from 'class-validator';

export class CreateNFTDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  attributes: Array<{ trait_type: string; value: string | number }>;

  @IsString()
  @IsOptional()
  @Matches(/^(ipfs:\/\/)?[a-zA-Z0-9]{46}$/, {
    message: 'Image must be either an IPFS CID or an IPFS URL (ipfs://CID)',
  })
  image?: string;
}
