// dto/create-produit.dto.ts
import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProduitType {
  FORMULE = 'FORMULE',
  PLAT = 'PLAT',
  EXTRA = 'EXTRA',
}

export class CreateProduitDto {
  @ApiProperty({ example: 'Pizza 4 Fromages' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 18.5 })
  @IsNumber()
  prix: number;

  @ApiProperty({ enum: ProduitType })
  @IsEnum(ProduitType)
  type: ProduitType;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
