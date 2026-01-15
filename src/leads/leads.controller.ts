import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { BatchCreateLeadsDto } from './dto/batch-create-leads.dto';
import { CloseLeadDto } from './dto/close-lead.dto';
import { AddFeedbackDto } from './dto/add-feedback.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { SuspendedAgentGuard } from './guards/suspended-agent.guard';
import { MaxLeadReservationGuard } from './guards/max-lead-reservation.guard';

@ApiTags('Leads Management')
@ApiBearerAuth('JWT-auth')
@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @UseGuards(PermissionsGuard, SuspendedAgentGuard)
  @RequirePermission('leads', 'create')
  @ApiOperation({ summary: 'Create a new lead (auto-reserves for 1 week)' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  @ApiResponse({ status: 403, description: 'Suspended/banned agents cannot create leads' })
  create(@Body() createLeadDto: CreateLeadDto, @Request() req) {
    return this.leadsService.create(createLeadDto, req.user.id);
  }

  @Post('batch')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Batch create leads from array' })
  @ApiResponse({ status: 201, description: 'Leads batch created with success/failure arrays' })
  batchCreate(@Body() batchCreateLeadsDto: BatchCreateLeadsDto, @Request() req) {
    return this.leadsService.batchCreate(batchCreateLeadsDto, req.user.id);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Get all leads with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated leads list' })
  findAll(@Query() query: LeadQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get('my')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'view_mines')
  @ApiOperation({ summary: 'Get my leads (reserved by current agent)' })
  @ApiResponse({ status: 200, description: 'Returns paginated leads list' })
  findMyLeads(@Query() query: LeadQueryDto, @Request() req) {
    return this.leadsService.findMyLeads(req.user.id, query);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Get overall lead statistics' })
  @ApiResponse({ status: 200, description: 'Returns total, closed, available, reserved, and conversion rate' })
  getStats() {
    return this.leadsService.getStats();
  }

  @Get('my-stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'view_mines')
  @ApiOperation({ summary: 'Get my lead statistics (agent)' })
  @ApiResponse({ status: 200, description: 'Returns myTotal, myClosed, myConversionRate' })
  getMyStats(@Request() req) {
    return this.leadsService.getMyStats(req.user.id);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'view_detail')
  @ApiOperation({ summary: 'Get single lead details with feedbacks' })
  @ApiResponse({ status: 200, description: 'Returns lead details' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard, SuspendedAgentGuard)
  @RequirePermission('leads', 'update_mines')
  @ApiOperation({ summary: 'Update lead details' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 403, description: 'Suspended/banned agents cannot update leads' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Delete a lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post(':id/reserve')
  @UseGuards(PermissionsGuard, SuspendedAgentGuard, MaxLeadReservationGuard)
  @RequirePermission('leads', 'update_mines')
  @ApiOperation({ summary: 'Reserve a lead (48-hour reservation, max 3 leads per agent)' })
  @ApiResponse({ status: 200, description: 'Lead reserved successfully' })
  @ApiResponse({ status: 400, description: 'Max 3 leads or already reserved' })
  @ApiResponse({ status: 403, description: 'Suspended/banned agents cannot reserve' })
  reserve(@Param('id') id: string, @Request() req) {
    return this.leadsService.reserve(id, req.user.id);
  }

  @Put(':id/make-available')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Make reserved lead available (HoS override)' })
  @ApiResponse({ status: 200, description: 'Lead made available' })
  @ApiResponse({ status: 400, description: 'Cannot make closed lead available' })
  makeAvailable(@Param('id') id: string, @Request() req) {
    return this.leadsService.makeAvailable(id, req.user.id);
  }

  @Post(':id/close')
  @UseGuards(PermissionsGuard, SuspendedAgentGuard)
  @RequirePermission('leads', 'update_mines')
  @ApiOperation({ summary: 'Close lead by linking to existing client' })
  @ApiResponse({ status: 200, description: 'Lead closed and linked to client' })
  @ApiResponse({ status: 400, description: 'Already closed or duplicate email' })
  @ApiResponse({ status: 403, description: 'Suspended/banned agents cannot close leads' })
  @ApiResponse({ status: 404, description: 'Client email not found in system' })
  close(
    @Param('id') id: string,
    @Body() closeLeadDto: CloseLeadDto,
    @Request() req,
  ) {
    return this.leadsService.close(id, closeLeadDto, req.user.id);
  }

  @Post(':id/feedback')
  @UseGuards(PermissionsGuard, SuspendedAgentGuard)
  @RequirePermission('leads', 'update_mines')
  @ApiOperation({ summary: 'Add feedback to a lead' })
  @ApiResponse({ status: 201, description: 'Feedback added successfully' })
  @ApiResponse({ status: 403, description: 'Suspended/banned agents cannot add feedback' })
  addFeedback(
    @Param('id') id: string,
    @Body() addFeedbackDto: AddFeedbackDto,
    @Request() req,
  ) {
    return this.leadsService.addFeedback(id, addFeedbackDto, req.user.id);
  }

  @Get(':id/feedback')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'view_detail')
  @ApiOperation({ summary: 'Get all feedbacks for a lead with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated feedbacks list' })
  getFeedbacks(@Param('id') id: string, @Query() query: LeadQueryDto) {
    return this.leadsService.getFeedbacks(id, query);
  }

  @Get(':id/history')
  @UseGuards(PermissionsGuard)
  @RequirePermission('leads', 'manage')
  @ApiOperation({ summary: 'Get agent assignment history for a lead with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated agent history' })
  getAgentHistory(@Param('id') id: string, @Query() query: LeadQueryDto) {
    return this.leadsService.getAgentHistory(id, query);
  }
}
