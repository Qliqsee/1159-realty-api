import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import {
  CreateResourceDto,
  UpdateResourceDto,
  ResourceQueryDto,
} from './dto/resource.dto';
import {
  CreateActionDto,
  UpdateActionDto,
  ActionQueryDto,
} from './dto/action.dto';
import { AttachResourceDto } from './dto/role-resource.dto';

@ApiTags('Permissions Management')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  // ========== GET ALL PERMISSIONS (Public endpoint for FE) ==========

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all permissions map (role -> resource -> actions)' })
  @ApiResponse({ status: 200, description: 'Returns complete permissions map' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  // ========== RESOURCES CRUD ==========

  @Post('resources')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Resource already exists' })
  createResource(@Body() data: CreateResourceDto) {
    return this.permissionsService.createResource(data);
  }

  @Get('resources')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'List all resources with pagination and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated resources list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAllResources(@Query() query: ResourceQueryDto) {
    return this.permissionsService.findAllResources(query);
  }

  @Get('resources/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Get resource by ID with roles attached' })
  @ApiResponse({ status: 200, description: 'Resource details retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  findOneResource(@Param('id') id: string) {
    return this.permissionsService.findOneResource(id);
  }

  @Patch('resources/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Update resource details' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 409, description: 'Resource name already exists' })
  updateResource(@Param('id') id: string, @Body() data: UpdateResourceDto) {
    return this.permissionsService.updateResource(id, data);
  }

  @Delete('resources/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Delete resource' })
  @ApiResponse({ status: 200, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  removeResource(@Param('id') id: string) {
    return this.permissionsService.removeResource(id);
  }

  // ========== ACTIONS CRUD ==========

  @Post('actions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Create a new action' })
  @ApiResponse({ status: 201, description: 'Action created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Action already exists' })
  createAction(@Body() data: CreateActionDto) {
    return this.permissionsService.createAction(data);
  }

  @Get('actions')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'List all actions with pagination and search' })
  @ApiResponse({ status: 200, description: 'Returns paginated actions list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAllActions(@Query() query: ActionQueryDto) {
    return this.permissionsService.findAllActions(query);
  }

  @Get('actions/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Get action by ID' })
  @ApiResponse({ status: 200, description: 'Action details retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Action not found' })
  findOneAction(@Param('id') id: string) {
    return this.permissionsService.findOneAction(id);
  }

  @Patch('actions/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Update action details' })
  @ApiResponse({ status: 200, description: 'Action updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Action not found' })
  @ApiResponse({ status: 409, description: 'Action name already exists' })
  updateAction(@Param('id') id: string, @Body() data: UpdateActionDto) {
    return this.permissionsService.updateAction(id, data);
  }

  @Delete('actions/:id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Delete action' })
  @ApiResponse({ status: 200, description: 'Action deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Action not found' })
  removeAction(@Param('id') id: string) {
    return this.permissionsService.removeAction(id);
  }

  // ========== ROLE-RESOURCE MANAGEMENT ==========

  @Post('roles/:roleId/resources')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Attach resource with actions to role (or update existing)' })
  @ApiResponse({ status: 201, description: 'Resource attached/updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role or resource not found' })
  attachResourceToRole(
    @Param('roleId') roleId: string,
    @Body() data: AttachResourceDto,
  ) {
    return this.permissionsService.attachResourceToRole(
      roleId,
      data.resourceId,
      data.actions,
    );
  }

  @Delete('roles/:roleId/resources/:resourceId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Detach resource from role' })
  @ApiResponse({ status: 200, description: 'Resource detached successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Role does not have this resource' })
  detachResourceFromRole(
    @Param('roleId') roleId: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.permissionsService.detachResourceFromRole(roleId, resourceId);
  }
}
