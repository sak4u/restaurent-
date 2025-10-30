import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './DTO/admin.dto';
import { LoginEmployeDto } from './DTO/employe.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login/admin')
  @ApiOperation({ summary: 'Login Admin' })
  @ApiResponse({ status: 201, description: 'Connexion réussie' })
  async loginAdmin(@Body() body: LoginAdminDto) {
    return this.authService.loginAdmin(body.email, body.password);
  }

  @Post('login/serveur')
  @ApiOperation({ summary: 'Login Serveur' })
  @ApiResponse({ status: 201, description: 'Connexion réussie' })
  async loginServeur(@Body() body: LoginEmployeDto) {
    return this.authService.loginServeur(body.codeUnique);
  }

  @Post('login/cuisinier')
  @ApiOperation({ summary: 'Login Cuisinier' })
  @ApiResponse({ status: 201, description: 'Connexion réussie' })
  async loginCuisinier(@Body() body: LoginEmployeDto) {
    return this.authService.loginCuisinier(body.codeUnique);
  }
}
