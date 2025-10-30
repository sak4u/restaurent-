import { Module } from '@nestjs/common';
import { ServeurController } from './serveur.controller';
import { ServeurService } from './serveur.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [ServeurController],
  providers: [ServeurService, PrismaService],
})
export class ServeurModule {}
