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
} from '@nestjs/swagger';
import { AdminsService } from './admins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { AdminQueryDto, ClientQueryDto, MyClientsQueryDto } from './dto/admin-query.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateBankAccountDto } from './dto/bank-account.dto';
import { ChangeRoleDto } from './dto/change-role.dto';
import {
  AdminResponseDto,
  AdminProfileResponseDto,
  AdminListResponseDto,
  BankAccountResponseDto,
} from './dto/admin-response.dto';
import {
  ClientListResponseDto,
  ClientDetailResponseDto,
} from '../clients/dto/client-response.dto';

@ApiTags('Admins')
@ApiBearerAuth('JWT-auth')
@Controller('admins')
@UseGuards(JwtAuthGuard)
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List all admins with filters, search, and pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated admins list', type: AdminListResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: AdminQueryDto): Promise<AdminListResponseDto> {
    return this.adminsService.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged in admin profile' })
  @ApiResponse({ status: 200, description: 'Admin profile retrieved successfully', type: AdminProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  getProfile(@Req() req: Request): Promise<AdminProfileResponseDto> {
    return this.adminsService.findByUserId(req.user['id']);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in admin profile including bank details' })
  @ApiBody({ type: UpdateAdminDto })
  @ApiResponse({ status: 200, description: 'Admin profile updated successfully', type: AdminProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  updateProfile(@Req() req: Request, @Body() updateData: UpdateAdminDto): Promise<AdminProfileResponseDto> {
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
  @ApiOperation({ summary: 'Get client by ID with full details' })
  @ApiResponse({ status: 200, description: 'Client details retrieved successfully', type: ClientDetailResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getClientById(@Param('id') id: string): Promise<ClientDetailResponseDto> {
    return this.adminsService.getClientById(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single admin by ID' })
  @ApiResponse({ status: 200, description: 'Admin retrieved successfully', type: AdminResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  findOne(@Param('id') id: string): Promise<AdminResponseDto> {
    return this.adminsService.findOne(id);
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

  @Patch(':id/bank-account')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update admin bank account details (Admin only)' })
  @ApiBody({ type: UpdateBankAccountDto })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  updateBankAccount(@Param('id') id: string, @Body() bankData: UpdateBankAccountDto) {
    return this.adminsService.updateBankAccount(id, bankData);
  }

  @Get(':id/bank-account')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get admin bank account details masked (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bank account retrieved successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin or bank account not found' })
  getBankAccount(@Param('id') id: string) {
    return this.adminsService.getBankAccount(id);
  }

  @Delete(':id/bank-account')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove admin bank account details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  deleteBankAccount(@Param('id') id: string) {
    return this.adminsService.deleteBankAccount(id);
  }
}
