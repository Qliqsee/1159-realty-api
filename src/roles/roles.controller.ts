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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';
import {
  RoleResponseDto,
  DeleteRoleResponseDto,
} from './dto/role-response.dto';

@ApiTags('Roles Management')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Post()
  @RequirePermission('users', 'manage')
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
  @RequirePermission('users', 'manage')
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
  @RequirePermission('users', 'manage')
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
  @RequirePermission('users', 'manage')
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
  @RequirePermission('users', 'manage')
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
}
