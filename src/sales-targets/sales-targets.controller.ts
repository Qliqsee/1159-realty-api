import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SalesTargetsService } from './sales-targets.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';
import { BatchCreateTargetsDto } from './dto/batch-create-targets.dto';
import { QuerySalesTargetsDto } from './dto/query-sales-targets.dto';
import { SalesTargetResponseDto } from './dto/sales-target-response.dto';
import { TargetStatsDto } from './dto/target-stats.dto';
import { TargetAchievementDto } from './dto/target-achievement.dto';
import { BatchCreateResponseDto } from './dto/batch-create-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Sales Management')
@ApiBearerAuth('JWT-auth')
@Controller('sales-targets')
@UseGuards(JwtAuthGuard)
export class SalesTargetsController {
  constructor(private readonly salesTargetsService: SalesTargetsService) {}

  // Admin/CRM endpoints
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Create a new sales target' })
  @ApiResponse({
    status: 201,
    description: 'Sales target created successfully',
    type: SalesTargetResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or overlapping period',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(
    @Body() createTargetDto: CreateSalesTargetDto,
    @Request() req,
  ): Promise<SalesTargetResponseDto> {
    return this.salesTargetsService.create(createTargetDto, req.user.id);
  }

  @Post('batch')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Batch create sales targets from JSON array' })
  @ApiResponse({
    status: 201,
    description: 'Returns success and failure arrays',
    type: BatchCreateResponseDto,
  })
  batchCreate(
    @Body() batchDto: BatchCreateTargetsDto,
    @Request() req,
  ): Promise<BatchCreateResponseDto> {
    return this.salesTargetsService.batchCreate(batchDto, req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({
    summary: 'Get all sales targets with pagination, search, and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated sales targets list',
  })
  findAll(@Query() query: QuerySalesTargetsDto) {
    return this.salesTargetsService.findAll(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Get overall sales target statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns overall statistics',
    type: TargetStatsDto,
  })
  getStats(): Promise<TargetStatsDto> {
    return this.salesTargetsService.getStats();
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('agent', 'admin')
  @ApiOperation({ summary: 'Get my sales targets with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns my paginated sales targets',
  })
  getMyTargets(@Query() query: QuerySalesTargetsDto, @Request() req) {
    return this.salesTargetsService.getMyTargets(req.user.id, query);
  }

  @Get('my-stats')
  @UseGuards(RolesGuard)
  @Roles('agent', 'admin')
  @ApiOperation({ summary: 'Get my sales target statistics' })
  @ApiResponse({
    status: 200,
    description: 'Returns my target statistics',
    type: TargetStatsDto,
  })
  getMyStats(@Request() req): Promise<TargetStatsDto> {
    return this.salesTargetsService.getMyStats(req.user.id);
  }

  @Get('my-current')
  @UseGuards(RolesGuard)
  @Roles('agent', 'admin')
  @ApiOperation({ summary: 'Get my current active sales target' })
  @ApiResponse({
    status: 200,
    description: 'Returns current active target or null',
    type: SalesTargetResponseDto,
  })
  getMyCurrent(@Request() req): Promise<SalesTargetResponseDto | null> {
    return this.salesTargetsService.getMyCurrent(req.user.id);
  }

  @Get('achievement-history/:userId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Get achievement history for a user' })
  @ApiResponse({
    status: 200,
    description: 'Returns achievement history',
    type: [TargetAchievementDto],
  })
  getAchievementHistory(
    @Param('userId') userId: string,
  ): Promise<TargetAchievementDto[]> {
    return this.salesTargetsService.getAchievementHistory(userId);
  }

  @Get('my-achievement-history')
  @UseGuards(RolesGuard)
  @Roles('agent', 'admin')
  @ApiOperation({ summary: 'Get my achievement history' })
  @ApiResponse({
    status: 200,
    description: 'Returns my achievement history',
    type: [TargetAchievementDto],
  })
  getMyAchievementHistory(@Request() req): Promise<TargetAchievementDto[]> {
    return this.salesTargetsService.getAchievementHistory(req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Get single sales target by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns target details',
    type: SalesTargetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Target not found' })
  findOne(@Param('id') id: string): Promise<SalesTargetResponseDto> {
    return this.salesTargetsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({ summary: 'Update sales target' })
  @ApiResponse({
    status: 200,
    description: 'Target updated successfully',
    type: SalesTargetResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Target not found' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or overlapping period',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSalesTargetDto,
  ): Promise<SalesTargetResponseDto> {
    return this.salesTargetsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'head-of-sales')
  @ApiOperation({
    summary: 'Delete sales target (archives to achievement history)',
  })
  @ApiResponse({
    status: 200,
    description: 'Target deleted and achievement archived',
  })
  @ApiResponse({ status: 404, description: 'Target not found' })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.salesTargetsService.remove(id);
  }
}
