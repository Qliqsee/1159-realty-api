import { Module } from '@nestjs/common';
import { SalesTargetsService } from './sales-targets.service';
import { SalesTargetsController } from './sales-targets.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SalesTargetsService, PrismaService],
  controllers: [SalesTargetsController],
})
export class SalesTargetsModule {}
