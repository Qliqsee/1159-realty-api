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
import { DisbursementsService } from './disbursements.service';
import { CreateDisbursementDto } from './dto/create-disbursement.dto';
import { BulkCreateDisbursementDto } from './dto/bulk-create-disbursement.dto';
import { QueryDisbursementsDto } from './dto/query-disbursements.dto';
import { ReleaseDisbursementDto, DisbursementReleaseResponseDto } from './dto/release-disbursement.dto';
import { DisbursementResponseDto, DisbursementStatsDto } from './dto/disbursement-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Disbursements')
@Controller('disbursements')
export class DisbursementsController {
  constructor(private disbursementsService: DisbursementsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Create disbursement from commission (admin only)',
    description: 'Creates a disbursement record for a single commission',
  })
  @ApiResponse({
    status: 201,
    description: 'Disbursement created successfully',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - commission already disbursed or invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Commission not found' })
  create(@Body() createDto: CreateDisbursementDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.disbursementsService.create(createDto, userId);
  }

  @Post('bulk')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Create disbursements from multiple commissions (admin only)',
    description: 'Creates disbursement records for multiple commissions in bulk',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk disbursements created',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  bulkCreate(@Body() bulkDto: BulkCreateDisbursementDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.disbursementsService.bulkCreate(bulkDto, userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all disbursements (admin only)',
    description: 'Returns paginated disbursements with filters, search, and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursements retrieved successfully',
    type: [DisbursementResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() queryDto: QueryDisbursementsDto) {
    return this.disbursementsService.findAll(queryDto);
  }

  @Get('my-disbursements')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'List own disbursements (agent only)',
    description: 'Returns paginated disbursements for the authenticated agent',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursements retrieved successfully',
    type: [DisbursementResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMyDisbursements(@Query() queryDto: QueryDisbursementsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.disbursementsService.findAll(queryDto, userId, 'agent');
  }

  @Get('my-partner-disbursements')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List partner disbursements (partner only, including suspended)',
    description: 'Returns paginated disbursements for the authenticated partner, accessible even when suspended',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursements retrieved successfully',
    type: [DisbursementResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findPartnerDisbursements(@Query() queryDto: QueryDisbursementsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.disbursementsService.findAll(queryDto, userId, 'partner');
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get disbursement statistics',
    description: 'Returns disbursement statistics with optional date range filtering. Role-based: agent/partner see only their own stats.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    type: DisbursementStatsDto,
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
    return this.disbursementsService.getStats(userId, userRole, dateFrom, dateTo);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get disbursement by ID',
    description: 'Returns detailed disbursement information. Access is role-based: agents and partners can only view their own disbursements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement retrieved successfully',
    type: DisbursementResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this disbursement' })
  @ApiResponse({ status: 404, description: 'Disbursement not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;
    return this.disbursementsService.findOne(id, userId, userRole);
  }

  @Post(':id/release')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Release disbursement payment via Paystack Transfer (admin only)',
    description: 'Transfers disbursement amount to recipient bank account using Paystack Transfer API. Updates disbursement status to RELEASED and records transfer details. If commission disbursement, also marks commission as PAID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Disbursement released successfully',
    type: DisbursementReleaseResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - disbursement already released or invalid bank details' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Disbursement not found' })
  release(@Param('id') id: string, @Body() releaseDto: ReleaseDisbursementDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.disbursementsService.release(id, releaseDto, userId);
  }
}
