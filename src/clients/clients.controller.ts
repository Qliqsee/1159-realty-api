import {
  Controller,
  Get,
  Patch,
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
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientIncludeQueryDto } from './dto/client-query.dto';
import {
  ClientResponseDto,
  ReferralsResponseDto,
} from './dto/client-response.dto';
import { AdminSummaryDto, ClientSummaryDto } from '../common/dto';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get logged in client profile',
    description: 'Returns authenticated client profile. Capabilities are always included. Use query params to selectively include related data (kyc, partnership, agent, partner).'
  })
  @ApiQuery({ name: 'includeKyc', required: false, type: Boolean, description: 'Include KYC summary' })
  @ApiQuery({ name: 'includePartnership', required: false, type: Boolean, description: 'Include partnership summary' })
  @ApiQuery({ name: 'includeAgent', required: false, type: Boolean, description: 'Include agent (closed by) summary' })
  @ApiQuery({ name: 'includePartner', required: false, type: Boolean, description: 'Include referring partner summary' })
  @ApiResponse({ status: 200, description: 'Client profile retrieved successfully', type: ClientResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  getProfile(@Req() req: Request, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.clientsService.findByUserId(req.user['id'], query);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in client profile' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client profile updated successfully', type: ClientResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  updateProfile(@Req() req: Request, @Body() updateData: UpdateClientDto): Promise<ClientResponseDto> {
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get client by ID',
    description: 'Returns client details by ID. Use query params to selectively include related data. Capabilities will be empty unless explicitly requested (and will be empty even if requested since viewing another user).'
  })
  @ApiQuery({ name: 'includeCapabilities', required: false, type: Boolean, description: 'Include capabilities (will be empty for non-owner)' })
  @ApiQuery({ name: 'includeKyc', required: false, type: Boolean, description: 'Include KYC summary' })
  @ApiQuery({ name: 'includePartnership', required: false, type: Boolean, description: 'Include partnership summary' })
  @ApiQuery({ name: 'includeAgent', required: false, type: Boolean, description: 'Include agent (closed by) summary' })
  @ApiQuery({ name: 'includePartner', required: false, type: Boolean, description: 'Include referring partner summary' })
  @ApiResponse({ status: 200, description: 'Client details retrieved successfully', type: ClientResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  findOne(@Param('id') id: string, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id, query);
  }
}
