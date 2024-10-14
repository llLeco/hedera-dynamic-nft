import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;
}