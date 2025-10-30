import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsArray } from 'class-validator';

export class AddProduitsToMenuDto {
  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  produitIds: number[];
}
