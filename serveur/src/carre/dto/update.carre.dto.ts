
import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCarreDto {
    @ApiProperty({ example: 'Carre A', description: 'Nom du carre', required: false })
  @IsOptional()
  @IsString()
  nom?: string;

    @ApiProperty({ example: 1, description: 'ID du serveur responsable', required: false })
  @IsOptional()
  @IsInt()
  serveurId?: number;

    @ApiProperty({ example: 5, description: 'Nombre de tables à générer', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number; // nouveau nombre de tables souhaité
}
