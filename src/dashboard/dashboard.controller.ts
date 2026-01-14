import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('admin-stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('dashboard', 'manage')
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description:
      'Returns comprehensive admin stats including enrollments, revenue, leads, sales targets, partners, and commissions. Each stat includes current value and change from end of previous month.',
  })
  @ApiResponse({
    status: 200,
    description: 'Admin statistics retrieved successfully',
    type: AdminStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  getAdminStats(): Promise<AdminStatsResponseDto> {
    return this.dashboardService.getAdminStats();
  }
}
