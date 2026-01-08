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
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QuerySchedulesDto } from './dto/query-schedules.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Schedules')
@ApiBearerAuth('JWT-auth')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new schedule (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Schedule created successfully',
    type: ScheduleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  create(
    @Body() createScheduleDto: CreateScheduleDto,
    @Request() req,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.create(createScheduleDto, req.user.id);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get all schedules with filters and pagination (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedules retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ScheduleResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QuerySchedulesDto): Promise<{
    data: ScheduleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.schedulesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get schedule by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Schedule retrieved successfully',
    type: ScheduleResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  findOne(@Param('id') id: string): Promise<ScheduleResponseDto> {
    return this.schedulesService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update schedule (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Schedule updated successfully',
    type: ScheduleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Request() req,
  ): Promise<ScheduleResponseDto> {
    return this.schedulesService.update(id, updateScheduleDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Delete schedule and auto-cancel linked appointments (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Schedule deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        cancelledAppointments: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  remove(
    @Param('id') id: string,
    @Request() req,
  ): Promise<{ message: string; cancelledAppointments: number }> {
    return this.schedulesService.remove(id, req.user.id);
  }
}
