import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import {
  CreatePermissionDto,
  AssignPermissionDto,
  PermissionQueryDto,
} from './dto/permission.dto';
import {
  RoleResponseDto,
  DeleteRoleResponseDto,
  RemovePermissionResponseDto,
} from './dto/role-response.dto';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Role with this name and context already exists' })
  create(@Body() data: CreateRoleDto) {
    return this.rolesService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all roles with pagination, search, and filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated roles list',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: RoleQueryDto) {
    return this.rolesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID with permissions' })
  @ApiResponse({
    status: 200,
    description: 'Role details retrieved successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role details' })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
    type: RoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  update(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
    type: DeleteRoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: 'Assign permission to role' })
  @ApiResponse({ status: 201, description: 'Permission assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role or permission not found' })
  @ApiResponse({ status: 409, description: 'Role already has this permission' })
  assignPermission(@Param('id') roleId: string, @Body() body: AssignPermissionDto) {
    return this.rolesService.assignPermission(roleId, body.permissionId);
  }

  @Delete(':id/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove permission from role' })
  @ApiResponse({
    status: 200,
    description: 'Permission removed successfully',
    type: RemovePermissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role does not have this permission' })
  removePermission(@Param('id') roleId: string, @Param('permissionId') permissionId: string) {
    return this.rolesService.removePermission(roleId, permissionId);
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'Permission created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Permission with this name already exists' })
  createPermission(@Body() data: CreatePermissionDto) {
    return this.rolesService.createPermission(data);
  }

  @Get('permissions/all')
  @ApiOperation({ summary: 'List all permissions with pagination and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated permissions list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAllPermissions(@Query() query: PermissionQueryDto) {
    return this.rolesService.findAllPermissions(query);
  }
}
