import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateFactureDto {
  @ApiProperty()  
  @IsNotEmpty()
  @IsNumber()
  commandeId: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  montant?: number; 
}
