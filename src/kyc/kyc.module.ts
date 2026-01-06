import { Module } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from '../prisma.module';
import { KycOwnershipGuard } from './guards/kyc-ownership.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';

@Module({
  imports: [PrismaModule],
  controllers: [KycController],
  providers: [KycService, KycOwnershipGuard, EmailVerifiedGuard],
  exports: [KycService],
})
export class KycModule {}
