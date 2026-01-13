import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateBankAccountDto } from './dto/bank-account.dto';
import {
  ClientProfileResponseDto,
  ClientDetailResponseDto,
  ReferralsResponseDto,
  BankAccountResponseDto,
} from './dto/client-response.dto';
import { AdminSummaryDto, ClientSummaryDto } from '../common/dto';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get logged in client profile' })
  @ApiResponse({ status: 200, description: 'Client profile retrieved successfully', type: ClientProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getProfile(@Req() req: Request): Promise<ClientProfileResponseDto> {
    return this.clientsService.findByUserId(req.user['id']);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in client profile' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client profile updated successfully', type: ClientProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  updateProfile(@Req() req: Request, @Body() updateData: UpdateClientDto): Promise<ClientProfileResponseDto> {
    return this.clientsService.updateProfile(req.user['id'], updateData);
  }

  @Get('my-agent')
  @ApiOperation({ summary: 'Get agent who closed the client lead if applicable' })
  @ApiResponse({ status: 200, description: 'Agent information retrieved successfully', type: AdminSummaryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getMyAgent(@Req() req: Request): Promise<AdminSummaryDto | { message: string }> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyAgent(clientId);
  }

  @Get('my-partner')
  @ApiOperation({ summary: 'Get partner who referred the client if applicable' })
  @ApiResponse({ status: 200, description: 'Partner information retrieved successfully', type: ClientSummaryDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getMyPartner(@Req() req: Request): Promise<ClientSummaryDto | { message: string }> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyPartner(clientId);
  }

  @Get('my-referrals')
  @ApiOperation({ summary: 'Get clients referred by this client if they are a partner' })
  @ApiResponse({ status: 200, description: 'Referrals retrieved successfully', type: ReferralsResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getMyReferrals(@Req() req: Request): Promise<ReferralsResponseDto> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyReferrals(clientId);
  }

  @Patch('bank-account')
  @ApiOperation({ summary: 'Update client bank account details' })
  @ApiBody({ type: UpdateBankAccountDto })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  updateBankAccount(@Req() req: Request, @Body() bankData: UpdateBankAccountDto) {
    const clientId = req.user['client']?.id;
    return this.clientsService.updateBankAccount(clientId, bankData);
  }

  @Get('bank-account')
  @ApiOperation({ summary: 'Get client bank account details masked' })
  @ApiResponse({ status: 200, description: 'Bank account retrieved successfully', type: BankAccountResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client or bank account not found' })
  getBankAccount(@Req() req: Request) {
    const clientId = req.user['client']?.id;
    return this.clientsService.getBankAccount(clientId);
  }

  @Delete('bank-account')
  @ApiOperation({ summary: 'Remove client bank account details' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  deleteBankAccount(@Req() req: Request) {
    const clientId = req.user['client']?.id;
    return this.clientsService.deleteBankAccount(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID with full details' })
  @ApiResponse({ status: 200, description: 'Client details retrieved successfully', type: ClientDetailResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string): Promise<ClientDetailResponseDto> {
    return this.clientsService.findOne(id);
  }
}
