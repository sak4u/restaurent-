import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCarreDto {
  @ApiProperty({ example: 'Carre A', description: 'Nom du carre' })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({ example: 1, description: 'ID du serveur responsable' })
  @IsOptional()
  @IsInt()
  serveurId?: number;

  @ApiProperty({ example: 5, description: 'Nombre de tables à générer' })
  @IsInt()
  @Min(1)
  count: number;
}
