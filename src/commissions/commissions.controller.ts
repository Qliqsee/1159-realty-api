import {
  Controller,
  Get,
  Param,
  Query,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Request } from 'express';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionsController {
  constructor(private commissionsService: CommissionsService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('commissions', 'manage')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('commissions', 'view_mines')
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

  @Get('my-partner-commissions')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'List partner commissions (partner only, including suspended)',
    description: 'Returns paginated commissions for the authenticated partner, accessible even when suspended',
  })
  @ApiResponse({
    status: 200,
    description: 'Commissions retrieved successfully',
    type: [CommissionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findPartnerCommissions(@Query() queryDto: QueryCommissionsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.commissionsService.findAll(queryDto, userId, 'partner');
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('commissions', 'create')
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('commissions', 'create')
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

}
