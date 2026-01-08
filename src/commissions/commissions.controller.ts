import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CommissionsService } from './commissions.service';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { CommissionResponseDto, CommissionStatsDto } from './dto/commission-response.dto';
import { ReleaseCommissionDto, CommissionReleaseResponseDto } from './dto/commission-release.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all commissions (admin only)',
    description: 'Returns paginated commissions with filters, search, and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Commissions retrieved successfully',
    type: [CommissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() queryDto: QueryCommissionsDto) {
    return this.commissionsService.findAll(queryDto);
  }

  @Get('my-commissions')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'List own commissions (agent only)',
    description: 'Returns paginated commissions for the authenticated agent',
  })
  @ApiResponse({
    status: 200,
    description: 'Commissions retrieved successfully',
    type: [CommissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMyCommissions(@Query() queryDto: QueryCommissionsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.commissionsService.findAll(queryDto, userId, 'agent');
  }

  @Get('partner')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @ApiOperation({
    summary: 'List partner commissions (partner only)',
    description: 'Returns paginated commissions for the authenticated partner',
  })
  @ApiResponse({
    status: 200,
    description: 'Commissions retrieved successfully',
    type: [CommissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findPartnerCommissions(@Query() queryDto: QueryCommissionsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.commissionsService.findAll(queryDto, userId, 'partner');
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get commission statistics',
    description: 'Returns commission statistics with optional date range filtering. Role-based: agent/partner see only their own stats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: CommissionStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role;
    return this.commissionsService.getStats(userId, userRole, dateFrom, dateTo);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get commission by ID',
    description: 'Returns detailed commission information. Access is role-based: agents and partners can only view their own commissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Commission retrieved successfully',
    type: CommissionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this commission' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;
    return this.commissionsService.findOne(id, userId, userRole);
  }

  @Post(':id/mark-paid')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Mark commission as paid (admin only)',
    description: 'Updates commission status to PAID and records payment date',
  })
  @ApiResponse({
    status: 200,
    description: 'Commission marked as paid successfully',
    type: CommissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - commission already paid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  markAsPaid(@Param('id') id: string) {
    return this.commissionsService.markAsPaid(id);
  }

  @Post(':id/release')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Release commission payment via Paystack Transfer (admin only)',
    description: 'Transfers commission amount to recipient bank account using Paystack Transfer API. Updates commission status to PAID and records transfer details.',
  })
  @ApiResponse({
    status: 200,
    description: 'Commission released successfully',
    type: CommissionReleaseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - commission already paid or invalid bank details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  releaseCommission(@Param('id') id: string, @Body() releaseDto: ReleaseCommissionDto) {
    return this.commissionsService.releaseCommission(id, releaseDto);
  }
}
