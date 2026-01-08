import { Module } from '@nestjs/common';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [CommissionsController],
  providers: [CommissionsService, PrismaService],
})
export class CommissionsModule {}
