import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { BrevoService } from './brevo.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ConfigModule],
  controllers: [CampaignsController],
  providers: [CampaignsService, BrevoService, PrismaService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
