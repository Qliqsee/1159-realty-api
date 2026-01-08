import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}
