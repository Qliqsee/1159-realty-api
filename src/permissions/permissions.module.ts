import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsCacheService } from './permissions-cache.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PermissionsService, PermissionsCacheService, PrismaService],
  controllers: [PermissionsController],
  exports: [PermissionsService, PermissionsCacheService],
})
export class PermissionsModule {}
