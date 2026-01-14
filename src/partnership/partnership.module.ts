import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { PrismaModule } from '../prisma.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, CommonModule],
  controllers: [PartnershipController],
  providers: [PartnershipService],
  exports: [PartnershipService],
})
export class PartnershipModule {}
