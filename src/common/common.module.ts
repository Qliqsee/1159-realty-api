import { Module, Global } from '@nestjs/common';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsModule } from '../permissions/permissions.module';

@Global()
@Module({
  imports: [PermissionsModule],
  providers: [PermissionsGuard, RolesGuard],
  exports: [PermissionsGuard, RolesGuard, PermissionsModule],
})
export class CommonModule {}
