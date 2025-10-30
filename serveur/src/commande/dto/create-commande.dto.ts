import { IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlatCommandeDto {
    @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  produitId: number;

    @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantite: number;
}

export class CreateCommandeDto {
      @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  tableId: number;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  serveurId: number;
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlatCommandeDto)
  plats: CreatePlatCommandeDto[];
}