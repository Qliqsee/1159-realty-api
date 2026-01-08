import { Module } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SchedulesService, PrismaService],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}
