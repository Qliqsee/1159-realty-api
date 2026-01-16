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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Appointments')
@Controller('appointments')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Client endpoints
  @Post('book')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Book an appointment (Client/Partner)' })
  @ApiResponse({
    status: 201,
    description: 'Appointment booked successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or past schedule',
  })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 409, description: 'Already booked' })
  book(
    @Body() bookAppointmentDto: BookAppointmentDto,
    @Request() req,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.book(bookAppointmentDto, req.user.id);
  }

  @Get('my-appointments')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Get my appointments with filters and pagination (Client/Partner)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AppointmentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findMyAppointments(
    @Query() query: QueryAppointmentsDto,
    @Request() req,
  ): Promise<{
    data: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.appointmentsService.findAllForClient(req.user.id, query);
  }

  @Delete(':id/cancel')
  @UseGuards(PermissionsGuard)
  @ApiOperation({ summary: 'Cancel my appointment (Client/Partner)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Already cancelled or past appointment',
  })
  @ApiResponse({ status: 403, description: 'Not your appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  cancelMyAppointment(
    @Param('id') id: string,
    @Request() req,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancel(id, req.user.id, false);
  }

  @Get('property/:propertyId')
  @UseGuards(PermissionsGuard)
  @ApiOperation({
    summary: 'Get my appointment for a specific property (Client/Partner)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully or null if no appointment',
    type: AppointmentResponseDto,
    schema: {
      oneOf: [
        { $ref: '#/components/schemas/AppointmentResponseDto' },
        { type: 'null' },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'Client profile not found' })
  findMyAppointmentForProperty(
    @Param('propertyId') propertyId: string,
    @Request() req,
  ): Promise<AppointmentResponseDto | null> {
    return this.appointmentsService.findUserAppointmentForProperty(
      req.user.id,
      propertyId,
    );
  }

  // Admin endpoints
  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('appointments', 'manage')
  @ApiOperation({
    summary: 'Get all appointments with filters and pagination (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Appointments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AppointmentResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findAll(@Query() query: QueryAppointmentsDto): Promise<{
    data: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.appointmentsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('appointments', 'manage')
  @ApiOperation({ summary: 'Get appointment by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment retrieved successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  findOne(@Param('id') id: string): Promise<AppointmentResponseDto> {
    return this.appointmentsService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('appointments', 'manage')
  @ApiOperation({ summary: 'Cancel any appointment (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Appointment cancelled successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Already cancelled',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  cancelAppointment(
    @Param('id') id: string,
    @Request() req,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.cancel(id, req.user.id, true);
  }
}
