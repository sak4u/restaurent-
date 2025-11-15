import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth(): { status: string } {
    return { status: 'OK' }; // Retourne un objet JSON pour indiquer que le serveur est vivant
  }
}