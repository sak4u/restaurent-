// dto/create-menu.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsInt } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'Menu Midi' })
  @IsString()
  nom: string;
}
