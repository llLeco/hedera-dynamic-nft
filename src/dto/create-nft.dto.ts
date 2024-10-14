import { IsString, IsArray, IsOptional, IsUrl } from 'class-validator';

export class CreateNFTDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  attributes: Array<{ trait_type: string; value: string | number }>;

  @IsUrl()
  @IsOptional()
  image?: string;
}
