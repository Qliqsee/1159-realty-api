import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { SegmentListQueryDto } from './dto/segment-list-query.dto';
import { SegmentResponseDto } from './dto/segment-response.dto';
import { PaginatedSegmentResponseDto } from './dto/paginated-segment-response.dto';
import { SegmentPreviewQueryDto } from './dto/segment-preview-query.dto';
import { SegmentPreviewResponseDto } from './dto/segment-preview-response.dto';
import { SyncSegmentResponseDto } from './dto/sync-segment-response.dto';
import { SegmentStatsDto } from './dto/segment-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Campaigns')
@Controller('campaigns')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermission('campaigns', 'manage')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('segments')
  @ApiOperation({
    summary: 'Create a new segment (Admin/Manager)',
    description:
      'Creates a new user segment based on criteria and automatically syncs to Brevo. At least one filter criteria must be provided.',
  })
  @ApiResponse({
    status: 201,
    description: 'Segment created successfully and synced to Brevo',
    type: SegmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid criteria or at least one filter required',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create segment in Brevo',
  })
  create(
    @Body() createSegmentDto: CreateSegmentDto,
    @Request() req,
  ): Promise<SegmentResponseDto> {
    return this.campaignsService.createSegment(createSegmentDto, req.user.id);
  }

  @Get('segments')
  @ApiOperation({
    summary: 'Get all segments with filters and pagination (Admin/Manager)',
    description:
      'Retrieve all segments with optional search on name/description, pagination, and filter by creator',
  })
  @ApiResponse({
    status: 200,
    description: 'Segments retrieved successfully',
    type: PaginatedSegmentResponseDto,
  })
  findAll(
    @Query() query: SegmentListQueryDto,
  ): Promise<PaginatedSegmentResponseDto> {
    return this.campaignsService.findAllSegments(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get campaign statistics (Admin/Manager)',
    description:
      'Returns total segments, total syncs, segments this month, and syncs this month',
  })
  @ApiResponse({
    status: 200,
    description: 'Stats retrieved successfully',
    type: SegmentStatsDto,
  })
  getStats(): Promise<SegmentStatsDto> {
    return this.campaignsService.getSegmentStats();
  }

  @Get('segments/:id')
  @ApiOperation({
    summary: 'Get segment by ID (Admin/Manager)',
    description: 'Retrieve full details of a specific segment',
  })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment retrieved successfully',
    type: SegmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  findOne(@Param('id') id: string): Promise<SegmentResponseDto> {
    return this.campaignsService.findSegmentById(id);
  }

  @Put('segments/:id')
  @ApiOperation({
    summary: 'Update segment (Admin/Manager)',
    description:
      'Update segment criteria and details. Changes are synced to Brevo automatically.',
  })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment updated successfully and synced to Brevo',
    type: SegmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid criteria',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update segment in Brevo',
  })
  update(
    @Param('id') id: string,
    @Body() updateSegmentDto: UpdateSegmentDto,
  ): Promise<SegmentResponseDto> {
    return this.campaignsService.updateSegment(id, updateSegmentDto);
  }

  @Delete('segments/:id')
  @ApiOperation({
    summary: 'Delete segment (Admin/Manager)',
    description:
      'Delete segment from database and remove associated list from Brevo',
  })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.campaignsService.deleteSegment(id);
    return { message: 'Segment deleted successfully' };
  }

  @Get('segments/:id/preview')
  @ApiOperation({
    summary: 'Preview users matching segment criteria (Admin/Manager)',
    description:
      'View users who match the segment criteria with pagination before syncing to Brevo',
  })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Preview retrieved successfully',
    type: SegmentPreviewResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  preview(
    @Param('id') id: string,
    @Query() query: SegmentPreviewQueryDto,
  ): Promise<SegmentPreviewResponseDto> {
    return this.campaignsService.previewSegment(id, query);
  }

  @Post('segments/:id/sync')
  @ApiOperation({
    summary: 'Sync segment users to Brevo (Admin/Manager)',
    description:
      'Query users matching segment criteria and sync them to the associated Brevo list with email and phone',
  })
  @ApiParam({ name: 'id', description: 'Segment ID' })
  @ApiResponse({
    status: 200,
    description: 'Segment synced successfully to Brevo',
    type: SyncSegmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Segment not found' })
  @ApiResponse({
    status: 400,
    description: 'Segment is not linked to a Brevo list',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to sync segment to Brevo',
  })
  sync(
    @Param('id') id: string,
    @Request() req,
  ): Promise<SyncSegmentResponseDto> {
    return this.campaignsService.syncSegmentToBrevo(id, req.user.id);
  }
}
