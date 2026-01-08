import { Module } from '@nestjs/common';
import { DisbursementConfigController } from './disbursement-config.controller';
import { DisbursementConfigService } from './disbursement-config.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DisbursementConfigController],
  providers: [DisbursementConfigService],
  exports: [DisbursementConfigService],
})
export class DisbursementConfigModule {}
