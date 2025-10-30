import { Module } from '@nestjs/common';
import { CarreService } from './carre.service';
import { CarreController } from './carre.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [CarreController],
  providers: [CarreService, PrismaService],
})
export class CarreModule {}
