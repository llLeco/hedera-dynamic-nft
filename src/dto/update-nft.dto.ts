import { IsString, IsObject, IsOptional, IsUrl } from 'class-validator';

export class UpdateNFTDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string | number>;

  @IsUrl()
  @IsOptional()
  image?: string;
}