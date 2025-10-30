// dto/login-serveur.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class LoginEmployeDto {
  @ApiProperty()
  codeUnique: string;
}
