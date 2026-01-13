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
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
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

@ApiTags('Admins')
@ApiBearerAuth('JWT-auth')
@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all admins with filters, search, and pagination (Admin only). Use includeCapabilities=true to include capabilities (may impact performance).' })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities for each admin (may impact performance on large lists)' })
  @ApiResponse({ status: 200, description: 'Returns paginated admins list', type: AdminListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: AdminQueryDto & AdminIncludeQueryDto): Promise<AdminListResponseDto> {
    return this.adminsService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in admin profile. Capabilities are always included for this endpoint.' })
  @ApiResponse({ status: 200, description: 'Admin profile retrieved successfully', type: AdminResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  getProfile(@Req() req: Request): Promise<AdminResponseDto> {
    return this.adminsService.findByUserId(req.user['id']);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in admin profile including bank details. Capabilities are always included in response.' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully', type: AdminResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  updateProfile(@Req() req: Request, @Body() updateData: UpdateAdminDto): Promise<AdminResponseDto> {
    return this.adminsService.updateProfile(req.user['id'], updateData);
  }

  @Get('my-clients')
  @UseGuards(RolesGuard)
  @Roles('agent')
  @ApiOperation({ summary: 'Get clients for logged in agent with filters, search, and pagination (Agent only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of agent clients', type: ClientListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getMyClients(@Req() req: Request, @Query() query: MyClientsQueryDto): Promise<ClientListResponseDto> {
    const adminId = req.user['admin']?.id;
    return this.adminsService.getMyClients(adminId, query);
  }

  @Get('clients')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all clients with filters, search, and pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of all clients', type: ClientListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiResponse({ status: 200, description: 'Client details retrieved successfully', type: ClientResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getClientById(@Param('id') id: string, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.adminsService.getClientById(id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single admin by ID. Use includeCapabilities=true to include capabilities.' })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities in response' })
  @ApiResponse({ status: 200, description: 'Admin retrieved successfully', type: AdminResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string, @Query() query: AdminIncludeQueryDto): Promise<AdminResponseDto> {
    return this.adminsService.findOne(id, query);
  }

  @Post(':id/ban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Ban admin - sets isBanned true on User table (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin banned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  banAdmin(@Param('id') id: string) {
    return this.adminsService.banAdmin(id);
  }

  @Post(':id/unban')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Unban admin - sets isBanned false on User table (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin unbanned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  unbanAdmin(@Param('id') id: string) {
    return this.adminsService.unbanAdmin(id);
  }

  @Post(':id/suspend')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Suspend admin - sets canOnboardClients false (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin suspended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  suspendAdmin(@Param('id') id: string) {
    return this.adminsService.suspendAdmin(id);
  }

  @Post(':id/unsuspend')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Unsuspend admin - sets canOnboardClients true (Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin unsuspended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  unsuspendAdmin(@Param('id') id: string) {
    return this.adminsService.unsuspendAdmin(id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Change admin role (Admin only)' })
  @ApiBody({ type: ChangeRoleDto })
  @ApiResponse({ status: 200, description: 'Admin role changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin or role not found' })
  changeRole(@Param('id') id: string, @Body() body: ChangeRoleDto) {
    return this.adminsService.changeRole(id, body.roleId);
  }
}
