import { IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePlatCommandeDto {
  @ApiProperty({
    description: 'ID du produit à commander',
    example: 1,
    type: Number
  })
  @IsNotEmpty({ message: 'L\'ID du produit est obligatoire' })
  @IsNumber({}, { message: 'L\'ID du produit doit être un nombre' })
  @IsPositive({ message: 'L\'ID du produit doit être positif' })
  @Transform(({ value }) => parseInt(value))
  produitId: number;

  @ApiProperty({
    description: 'Quantité du produit à commander',
    example: 2,
    minimum: 1,
    type: Number
  })
  @IsNotEmpty({ message: 'La quantité est obligatoire' })
  @IsNumber({}, { message: 'La quantité doit être un nombre' })
  @Min(1, { message: 'La quantité doit être d\'au moins 1' })
  @Transform(({ value }) => parseInt(value))
  quantite: number;
}