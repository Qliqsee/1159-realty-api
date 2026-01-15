import { Module, forwardRef } from '@nestjs/common';
import { KycService } from './kyc.service';
import { KycController } from './kyc.controller';
import { PrismaModule } from '../prisma.module';
import { EmailModule } from '../email/email.module';
import { CommonModule } from '../common/common.module';
import { KycOwnershipGuard } from './guards/kyc-ownership.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { ClientsModule } from '../clients/clients.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    CommonModule,
    forwardRef(() => ClientsModule),
  ],
  controllers: [KycController],
  providers: [KycService, KycOwnershipGuard, EmailVerifiedGuard],
  exports: [KycService],
})
export class KycModule {}
