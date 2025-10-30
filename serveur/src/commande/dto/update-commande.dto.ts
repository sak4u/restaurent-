import { PartialType,ApiProperty } from '@nestjs/swagger';
import { CreateCommandeDto } from './create-commande.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { EtatPreparation } from '@prisma/client'; // adapte le chemin selon l’emplacement de ton service

export class UpdateCommandeDto extends PartialType(CreateCommandeDto) {}

export class UpdatePlatCommandeDto {
  @ApiProperty()
  @IsOptional()
  @IsEnum(EtatPreparation)
  etatPreparation?: EtatPreparation;
}
