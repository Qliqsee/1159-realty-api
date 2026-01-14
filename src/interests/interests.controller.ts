import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestListQueryDto } from './dto/interest-list-query.dto';
import { InterestResponseDto } from './dto/interest-response.dto';
import { InterestStatsDto } from './dto/interest-stats.dto';
import { PaginatedInterestResponseDto } from './dto/paginated-interest-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Interests')
@Controller('interests')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  // Client endpoints
  @Post()
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Express interest in a property (Client/Partner)',
    description: 'Client or partner expresses interest in a property with an optional message',
  })
  @ApiResponse({
    status: 201,
    description: 'Interest created successfully',
    type: InterestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'You have already expressed interest in this property',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  create(
    @Body() createInterestDto: CreateInterestDto,
    @Request() req,
  ): Promise<InterestResponseDto> {
    return this.interestsService.create(createInterestDto, req.user.id);
  }

  @Get('my-interests')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Get my interests with filters and pagination (Client/Partner)',
    description: 'View all interests expressed by the authenticated client',
  })
  @ApiResponse({
    status: 200,
    description: 'Interests retrieved successfully',
    type: PaginatedInterestResponseDto,
  })
  findMyInterests(
    @Query() query: InterestListQueryDto,
    @Request() req,
  ): Promise<PaginatedInterestResponseDto> {
    return this.interestsService.findMyInterests(req.user.id, query);
  }

  // Admin endpoints
  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('client-interests', 'manage')
  @ApiOperation({
    summary: 'Get interest statistics (Admin/Manager)',
    description: 'Returns total interests, open interests, and closed interests',
  })
  @ApiResponse({
    status: 200,
    description: 'Stats retrieved successfully',
    type: InterestStatsDto,
  })
  getStats(): Promise<InterestStatsDto> {
    return this.interestsService.getStats();
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('client-interests', 'create')
  @ApiOperation({
    summary: 'Get all interests with filters and pagination (Admin/Manager/Agent)',
    description: 'Admin and managers can view all interests. Supports search on client name, property name, agent name, and message. Supports filters by status, propertyId, clientId, agentId, and date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interests retrieved successfully',
    type: PaginatedInterestResponseDto,
  })
  findAll(@Query() query: InterestListQueryDto): Promise<PaginatedInterestResponseDto> {
    return this.interestsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get interest by ID',
    description: 'Admins/managers can view any interest. Clients can only view their own interests.',
  })
  @ApiParam({ name: 'id', description: 'Interest ID' })
  @ApiResponse({
    status: 200,
    description: 'Interest retrieved successfully',
    type: InterestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  @ApiResponse({ status: 403, description: 'You can only view your own interests' })
  findOne(@Param('id') id: string, @Request() req): Promise<InterestResponseDto> {
    const isAdmin = req.user.roles?.some((role: string) =>
      ['admin', 'manager'].includes(role),
    );
    return this.interestsService.findOne(id, req.user.id, isAdmin);
  }

  @Post(':id/mark-attended')
  @UseGuards(PermissionsGuard)
  @RequirePermission('client-interests', 'manage')
  @ApiOperation({
    summary: 'Mark interest as attended (Admin/Manager)',
    description: 'Changes the status to CLOSED and sets contactedAt timestamp',
  })
  @ApiParam({ name: 'id', description: 'Interest ID' })
  @ApiResponse({
    status: 200,
    description: 'Interest marked as attended successfully',
    type: InterestResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Interest not found' })
  @ApiResponse({
    status: 400,
    description: 'Interest is already marked as attended',
  })
  markAsAttended(@Param('id') id: string): Promise<InterestResponseDto> {
    return this.interestsService.markAsAttended(id);
  }
}
