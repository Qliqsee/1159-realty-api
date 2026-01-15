import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PartnershipService } from './partnership.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { KycCompletionGuard } from '../common/guards/kyc-completion.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import {
  ApplyPartnershipResponseDto,
} from './dto/apply-partnership.dto';
import {
  PartnershipResponseDto,
  PartnershipWithUserDto,
} from './dto/partnership-response.dto';
import {
  ApprovePartnershipResponseDto,
  RejectPartnershipResponseDto,
} from './dto/review-partnership.dto';
import {
  ListPartnershipsQueryDto,
  ListPartnershipsResponseDto,
} from './dto/list-partnerships.dto';
import {
  SuspendPartnershipResponseDto,
  UnsuspendPartnershipResponseDto,
} from './dto/suspend-partnership.dto';
import {
  ListPartnerClientsQueryDto,
} from './dto/list-partner-clients.dto';
import {
  ListPartnerClientsResponseDto,
  PartnerClientDetailDto,
} from './dto/partner-client-response.dto';
import {
  PartnerDashboardDto,
} from './dto/partner-dashboard.dto';

@ApiTags('Partnership')
@Controller('partnership')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  // Client Endpoints

  @Post('apply')
  @UseGuards(KycCompletionGuard)
  @RequirePermissions('partnership:apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply for partnership (requires approved KYC)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership application submitted successfully',
    type: ApplyPartnershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - KYC not approved or in cooldown' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - KYC not verified' })
  async applyForPartnership(@Req() req): Promise<ApplyPartnershipResponseDto> {
    const partnership = await this.partnershipService.applyForPartnership(
      req.user.userId,
    );
    return {
      message: 'Partnership application submitted successfully',
      status: partnership.status,
      appliedAt: partnership.appliedAt,
    };
  }

  @Get('me')
  @RequirePermissions('partnership:view_own')
  @ApiOperation({ summary: 'Get my partnership status' })
  @ApiResponse({
    status: 200,
    description: 'Partnership status retrieved',
    type: PartnershipResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPartnership(@Req() req): Promise<PartnershipResponseDto | null> {
    return this.partnershipService.getMyPartnership(req.user.userId);
  }

  // Admin Endpoints

  @Get()
  @RequirePermissions('partnership:view_all')
  @ApiOperation({ summary: 'List all partnerships with filters (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of partnerships with pagination',
    type: ListPartnershipsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listPartnerships(
    @Query() query: ListPartnershipsQueryDto,
  ): Promise<ListPartnershipsResponseDto> {
    return this.partnershipService.listPartnerships(
      query.search,
      query.status,
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
    );
  }

  @Get(':id')
  @RequirePermissions('partnership:view_all')
  @ApiOperation({ summary: 'Get partnership by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership details',
    type: PartnershipWithUserDto,
  })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPartnershipById(@Param('id') id: string) {
    return this.partnershipService.getPartnershipById(id);
  }

  @Patch(':id/approve')
  @RequirePermissions('partnership:review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve partnership application (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership approved successfully',
    type: ApprovePartnershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Only pending applications can be approved' })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approvePartnership(
    @Param('id') id: string,
    @Req() req,
  ): Promise<ApprovePartnershipResponseDto> {
    const partnership = await this.partnershipService.approvePartnership(
      id,
      req.user.userId,
    );
    return {
      message: 'Partnership approved successfully',
      partnershipId: partnership.id,
      status: partnership.status,
    };
  }

  @Patch(':id/reject')
  @RequirePermissions('partnership:review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject partnership application (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership rejected successfully',
    type: RejectPartnershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Only pending applications can be rejected' })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectPartnership(
    @Param('id') id: string,
    @Req() req,
  ): Promise<RejectPartnershipResponseDto> {
    const partnership = await this.partnershipService.rejectPartnership(
      id,
      req.user.userId,
    );
    return {
      message: 'Partnership rejected successfully',
      partnershipId: partnership.id,
      status: partnership.status,
      rejectionCooldown: partnership.rejectionCooldown,
    };
  }

  @Patch(':id/suspend')
  @RequirePermissions('partnership:suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend approved partnership (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership suspended successfully',
    type: SuspendPartnershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Only approved partnerships can be suspended or already suspended' })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async suspendPartnership(
    @Param('id') id: string,
    @Req() req,
  ): Promise<SuspendPartnershipResponseDto> {
    const partnership = await this.partnershipService.suspendPartnership(
      id,
      req.user.userId,
    );
    return {
      message: 'Partnership suspended successfully',
      partnershipId: partnership.id,
      status: partnership.status,
      suspendedAt: partnership.suspendedAt,
    };
  }

  @Patch(':id/unsuspend')
  @RequirePermissions('partnership:suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsuspend partnership (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Partnership unsuspended successfully',
    type: UnsuspendPartnershipResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Partnership is not suspended' })
  @ApiResponse({ status: 404, description: 'Partnership not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async unsuspendPartnership(
    @Param('id') id: string,
    @Req() req,
  ): Promise<UnsuspendPartnershipResponseDto> {
    const partnership = await this.partnershipService.unsuspendPartnership(
      id,
      req.user.userId,
    );
    return {
      message: 'Partnership unsuspended successfully',
      partnershipId: partnership.id,
      status: partnership.status,
    };
  }

  // Partner Endpoints

  @Get('my-clients')
  @RequirePermissions('partnership:view_clients')
  @ApiOperation({ summary: 'Get clients onboarded by partner (Partner only)' })
  @ApiResponse({
    status: 200,
    description: 'List of clients with pagination',
    type: ListPartnerClientsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPartnerClients(
    @Query() query: ListPartnerClientsQueryDto,
    @Req() req,
  ): Promise<ListPartnerClientsResponseDto> {
    return this.partnershipService.getPartnerClients(
      req.user.userId,
      query.search,
      query.enrollmentStatus,
      query.page ? parseInt(query.page) : 1,
      query.limit ? parseInt(query.limit) : 20,
    );
  }

  @Get('my-clients/:clientId')
  @RequirePermissions('partnership:view_clients')
  @ApiOperation({ summary: 'Get client details with enrollments and commissions (Partner only)' })
  @ApiResponse({
    status: 200,
    description: 'Client details retrieved',
    type: PartnerClientDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Client not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPartnerClientDetail(
    @Param('clientId') clientId: string,
    @Req() req,
  ): Promise<PartnerClientDetailDto> {
    return this.partnershipService.getPartnerClientDetail(req.user.userId, clientId);
  }

  @Get('dashboard')
  @RequirePermissions('partnership:view_clients')
  @ApiOperation({ summary: 'Get partner dashboard with stats and revenue (Partner only)' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved',
    type: PartnerDashboardDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getPartnerDashboard(@Req() req): Promise<PartnerDashboardDto> {
    return this.partnershipService.getPartnerDashboard(req.user.userId);
  }
}
