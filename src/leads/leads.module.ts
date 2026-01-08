import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { PrismaService } from '../prisma.service';
import { SuspendedAgentGuard } from './guards/suspended-agent.guard';
import { MaxLeadReservationGuard } from './guards/max-lead-reservation.guard';

@Module({
  providers: [
    LeadsService,
    PrismaService,
    SuspendedAgentGuard,
    MaxLeadReservationGuard,
  ],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
