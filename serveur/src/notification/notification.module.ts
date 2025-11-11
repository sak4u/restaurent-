import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [NotificationGateway, NotificationService, PrismaService],
  exports: [NotificationService,NotificationGateway],
})
export class NotificationModule {}
