import { IsInt, Min } from 'class-validator';

export class GenerateTablesDto {
  @IsInt()
  @Min(1)
  count: number;
}
