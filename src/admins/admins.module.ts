import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { PrismaService } from '../prisma.service';
import { CapabilitiesModule } from '../capabilities/capabilities.module';

@Module({
  imports: [CapabilitiesModule],
  controllers: [AdminsController],
  providers: [AdminsService, PrismaService],
  exports: [AdminsService],
})
export class AdminsModule {}
