import { Module } from '@nestjs/common';
import { CapabilitiesService } from './capabilities.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [CapabilitiesService, PrismaService],
  exports: [CapabilitiesService],
})
export class CapabilitiesModule {}
