import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Request } from 'express';
import { AdminQueryDto, ClientQueryDto, MyClientsQueryDto } from './dto/admin-query.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminIncludeQueryDto } from './dto/admin-include-query.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import {
  AdminResponseDto,
  AdminListResponseDto,
} from './dto/admin-response.dto';
import {
  ClientListResponseDto,
  ClientResponseDto,
} from '../clients/dto/client-response.dto';
import { ClientIncludeQueryDto } from '../clients/dto/client-query.dto';
import {
  ApiStandardResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-standard-responses.decorator';

@ApiTags('Admins')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(AdminResponseDto, AdminListResponseDto, ClientResponseDto, ClientListResponseDto)
@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'List all admins with filters, search, and pagination (Admin only). Use includeCapabilities=true to include capabilities (may impact performance).' })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities for each admin (may impact performance on large lists)' })
  @ApiStandardResponse(200, 'Returns paginated admins list', AdminListResponseDto)
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  findAll(@Query() query: AdminQueryDto & AdminIncludeQueryDto): Promise<AdminListResponseDto> {
    return this.adminsService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in admin profile. Capabilities are always included for this endpoint.' })
  @ApiStandardResponse(200, 'Admin profile retrieved successfully', AdminResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Admin')
  getProfile(@Req() req: Request): Promise<AdminResponseDto> {
    return this.adminsService.findByUserId(req.user['id']);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in admin profile including bank details. Capabilities are always included in response.' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiStandardResponse(200, 'Admin profile updated successfully', AdminResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Admin')
  updateProfile(@Req() req: Request, @Body() updateData: UpdateAdminDto): Promise<AdminResponseDto> {
    return this.adminsService.updateProfile(req.user['id'], updateData);
  }

  @Get('my-clients')
  @UseGuards(PermissionsGuard)
  @RequirePermission('clients', 'view_mines')
  @ApiOperation({ summary: 'Get clients for logged in agent with filters, search, and pagination (Agent only)' })
  @ApiStandardResponse(200, 'Returns paginated list of agent clients', ClientListResponseDto)
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  getMyClients(@Req() req: Request, @Query() query: MyClientsQueryDto): Promise<ClientListResponseDto> {
    const adminId = req.user['admin']?.id;
    return this.adminsService.getMyClients(adminId, query);
  }

  @Get('clients')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Get all clients with filters, search, and pagination (Admin only)' })
  @ApiStandardResponse(200, 'Returns paginated list of all clients', ClientListResponseDto)
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  getAllClients(@Query() query: ClientQueryDto): Promise<ClientListResponseDto> {
    return this.adminsService.getAllClients(query);
  }

  @Get('clients/:id')
  @ApiOperation({ summary: 'Get client by ID. Use query params to include optional fields (includeKyc, includePartnership, includeAgent, includePartner).' })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities (always empty for admin viewing clients)' })
  @ApiQuery({ name: 'includeKyc', required: false, type: Boolean, description: 'Include KYC summary' })
  @ApiQuery({ name: 'includePartnership', required: false, type: Boolean, description: 'Include partnership summary' })
  @ApiQuery({ name: 'includeAgent', required: false, type: Boolean, description: 'Include agent (closed by) summary' })
  @ApiQuery({ name: 'includePartner', required: false, type: Boolean, description: 'Include referring partner summary' })
  @ApiStandardResponse(200, 'Client details retrieved successfully', ClientResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  getClientById(@Param('id') id: string, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.adminsService.getClientById(id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single admin by ID. Use includeCapabilities=true to include capabilities.' })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities in response' })
  @ApiStandardResponse(200, 'Admin retrieved successfully', AdminResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Admin')
  findOne(@Param('id') id: string, @Query() query: AdminIncludeQueryDto): Promise<AdminResponseDto> {
    return this.adminsService.findOne(id, query);
  }

  @Post(':id/ban')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Ban admin - sets isBanned true on User table (Admin only)' })
  @ApiStandardResponse(201, 'Admin banned successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Admin')
  banAdmin(@Param('id') id: string) {
    return this.adminsService.banAdmin(id);
  }

  @Post(':id/unban')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Unban admin - sets isBanned false on User table (Admin only)' })
  @ApiStandardResponse(201, 'Admin unbanned successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Admin')
  unbanAdmin(@Param('id') id: string) {
    return this.adminsService.unbanAdmin(id);
  }

  @Post(':id/suspend')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Suspend admin - sets canOnboardClients false (Admin only)' })
  @ApiStandardResponse(201, 'Admin suspended successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Admin')
  suspendAdmin(@Param('id') id: string) {
    return this.adminsService.suspendAdmin(id);
  }

  @Post(':id/unsuspend')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Unsuspend admin - sets canOnboardClients true (Admin only)' })
  @ApiStandardResponse(201, 'Admin unsuspended successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Admin')
  unsuspendAdmin(@Param('id') id: string) {
    return this.adminsService.unsuspendAdmin(id);
  }

  @Patch(':id/role')
  @UseGuards(PermissionsGuard)
  @RequirePermission('users', 'manage')
  @ApiOperation({ summary: 'Change admin role (Admin only)' })
  @ApiBody({ type: ChangeRoleDto })
  @ApiStandardResponse(200, 'Admin role changed successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Admin or role')
  changeRole(@Param('id') id: string, @Body() body: ChangeRoleDto) {
    return this.adminsService.changeRole(id, body.roleId);
  }
}
