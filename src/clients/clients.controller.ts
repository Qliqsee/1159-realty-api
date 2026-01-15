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
  ApiBody,
  ApiQuery,
  ApiExtraModels,
} from '@nestjs/swagger';
import {
  ApiStandardResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-standard-responses.decorator';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientIncludeQueryDto } from './dto/client-query.dto';
import {
  ClientResponseDto,
  ReferralsResponseDto,
} from './dto/client-response.dto';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto
} from '../common/dto';

@ApiTags('Clients')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(
  ClientResponseDto,
  ReferralsResponseDto,
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto
)
@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get logged in client profile',
    description: 'Returns authenticated client profile. Use query params to selectively include related data (kyc, partnership, agent, partner).'
  })
  @ApiQuery({ name: 'includeKyc', required: false, type: Boolean, description: 'Include KYC summary' })
  @ApiQuery({ name: 'includePartnership', required: false, type: Boolean, description: 'Include partnership summary' })
  @ApiQuery({ name: 'includeAgent', required: false, type: Boolean, description: 'Include agent (closed by) summary' })
  @ApiQuery({ name: 'includePartner', required: false, type: Boolean, description: 'Include referring partner summary' })
  @ApiStandardResponse(200, 'Client profile retrieved successfully', ClientResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  getProfile(@Req() req: Request, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.clientsService.findByUserId(req.user['id'], query);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update logged in client profile' })
  @ApiBody({ type: UpdateClientDto })
  @ApiStandardResponse(200, 'Client profile updated successfully', ClientResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  updateProfile(@Req() req: Request, @Body() updateData: UpdateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.updateProfile(req.user['id'], updateData);
  }

  @Get('my-agent')
  @ApiOperation({ summary: 'Get agent who closed the client lead if applicable' })
  @ApiStandardResponse(200, 'Agent information retrieved successfully', AdminSummaryDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  getMyAgent(@Req() req: Request): Promise<AdminSummaryDto | { message: string }> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyAgent(clientId);
  }

  @Get('my-partner')
  @ApiOperation({ summary: 'Get partner who referred the client if applicable' })
  @ApiStandardResponse(200, 'Partner information retrieved successfully', ClientSummaryDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  getMyPartner(@Req() req: Request): Promise<ClientSummaryDto | { message: string }> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyPartner(clientId);
  }

  @Get('my-referrals')
  @ApiOperation({ summary: 'Get clients referred by this client if they are a partner' })
  @ApiStandardResponse(200, 'Referrals retrieved successfully', ReferralsResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  getMyReferrals(@Req() req: Request): Promise<ReferralsResponseDto> {
    const clientId = req.user['client']?.id;
    return this.clientsService.getMyReferrals(clientId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get client by ID',
    description: 'Returns client details by ID. Use query params to selectively include related data.'
  })
  @ApiQuery({ name: 'includeKyc', required: false, type: Boolean, description: 'Include KYC summary' })
  @ApiQuery({ name: 'includePartnership', required: false, type: Boolean, description: 'Include partnership summary' })
  @ApiQuery({ name: 'includeAgent', required: false, type: Boolean, description: 'Include agent (closed by) summary' })
  @ApiQuery({ name: 'includePartner', required: false, type: Boolean, description: 'Include referring partner summary' })
  @ApiStandardResponse(200, 'Client details retrieved successfully', ClientResponseDto)
  @ApiUnauthorizedResponse()
  @ApiNotFoundResponse('Client')
  findOne(@Param('id') id: string, @Query() query: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    return this.clientsService.findOne(id, query);
  }
}
