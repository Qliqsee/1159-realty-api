import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  create(@Body() data: { name: string; appContext: string; description?: string }) {
    return this.rolesService.create(data);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { name?: string; appContext?: string; description?: string }) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  assignPermission(@Param('id') roleId: string, @Body('permissionId') permissionId: string) {
    return this.rolesService.assignPermission(roleId, permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  removePermission(@Param('id') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.removePermission(roleId, permissionId);
  }

  @Post('permissions')
  createPermission(@Body() data: { name: string; resource: string; action: string; description?: string }) {
    return this.rolesService.createPermission(data);
  }

  @Get('permissions/all')
  findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }
}
