import { Module } from '@nestjs/common';
import { FactureService } from './facture.service';
import { FactureController } from './facture.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CommandeModule } from '../commande/commande.module';

@Module({
  imports: [PrismaModule, CommandeModule],
  controllers: [FactureController],
  providers: [FactureService],
  exports: [FactureService],
})
export class FactureModule {}