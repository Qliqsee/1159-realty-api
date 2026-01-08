import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
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
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';
import { LinkClientDto } from './dto/link-client.dto';
import { GeneratePaymentLinkDto } from './dto/generate-payment-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @ApiOperation({
    summary: 'Create enrollment (admin/agent)',
    description:
      'Admin can select agent and enrollment date. Agent auto-populates own ID.',
  })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role || 'admin';
    return this.enrollmentsService.create(createEnrollmentDto, userId, userRole);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all enrollments (admin only)',
    description: 'Returns paginated enrollments with filters and search',
  })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() queryDto: QueryEnrollmentsDto) {
    return this.enrollmentsService.findAll(queryDto);
  }

  @Get('my-enrollments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'List own enrollments (agent only)',
    description: 'Returns paginated enrollments for the authenticated agent',
  })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMyEnrollments(@Query() queryDto: QueryEnrollmentsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.findAll(queryDto, userId, 'agent');
  }

  @Get('client')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiOperation({
    summary: 'List own enrollments (client only)',
    description: 'Returns paginated enrollments for the authenticated client',
  })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findClientEnrollments(@Query() queryDto: QueryEnrollmentsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.findAll(queryDto, userId, 'client');
  }

  @Get('dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get enrollment dashboard with metrics and trends',
    description: 'Returns comprehensive dashboard data including enrollments, revenue, commissions, monthly trends, and conversion rates. Role-based: agents/partners see only their own data.',
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getDashboard(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role || 'admin';
    return this.enrollmentsService.getDashboard(userId, userRole, dateFrom, dateTo);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get enrollment statistics (admin only)',
    description: 'Returns enrollment counts and revenue metrics',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('agentId') agentId?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.enrollmentsService.getStats(dateFrom, dateTo, agentId, propertyId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'client')
  @ApiOperation({
    summary: 'Get enrollment details',
    description:
      'Returns full enrollment details with invoices and commissions based on role',
  })
  @ApiResponse({ status: 200, description: 'Enrollment details retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role || 'admin';
    return this.enrollmentsService.findOne(id, userId, userRole);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Cancel enrollment (admin only)',
    description: 'Cancels an enrollment and tracks who cancelled it',
  })
  @ApiResponse({ status: 200, description: 'Enrollment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - already cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  cancel(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.cancel(id, userId);
  }

  @Patch(':id/resume')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Resume suspended enrollment (admin only)',
    description: 'Resumes a suspended enrollment and resets grace period',
  })
  @ApiResponse({ status: 200, description: 'Enrollment resumed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - only suspended enrollments can be resumed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  resume(@Param('id') id: string) {
    return this.enrollmentsService.resume(id);
  }

  @Patch(':id/link-client')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Link client to enrollment (admin only)',
    description: 'Links a client to an enrollment and disables payment links',
  })
  @ApiResponse({ status: 200, description: 'Client linked successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - enrollment already has client or duplicate enrollment',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment or client not found' })
  linkClient(@Param('id') id: string, @Body() linkClientDto: LinkClientDto) {
    return this.enrollmentsService.linkClient(id, linkClientDto);
  }

  @Post(':id/generate-payment-link')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @ApiOperation({
    summary: 'Generate payment link (admin/agent)',
    description:
      'Generates a shareable payment link for an invoice. Requires first/last name if no client linked.',
  })
  @ApiResponse({ status: 201, description: 'Payment link generated successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - names required or no unpaid invoices or sequential payment violation',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment or invoice not found' })
  generatePaymentLink(
    @Param('id') id: string,
    @Body() generateDto: GeneratePaymentLinkDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.generatePaymentLink(id, generateDto, userId);
  }
}
