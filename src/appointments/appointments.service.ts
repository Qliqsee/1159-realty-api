import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { Prisma, AppointmentStatus } from '@prisma/client';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async book(
    bookAppointmentDto: BookAppointmentDto,
    userId: string,
  ): Promise<AppointmentResponseDto> {
    const { scheduleId } = bookAppointmentDto;

    // Validate schedule exists
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: {
        property: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Validate schedule is in the future
    if (schedule.dateTime <= new Date()) {
      throw new BadRequestException('Cannot book appointment for past schedules');
    }

    // Check if user already has an appointment for this schedule
    const existingAppointment = await this.prisma.appointment.findUnique({
      where: {
        scheduleId_userId: {
          scheduleId,
          userId,
        },
      },
    });

    if (existingAppointment && existingAppointment.status === 'BOOKED') {
      throw new ConflictException('You have already booked this appointment');
    }

    if (existingAppointment && existingAppointment.status === 'CANCELLED') {
      // Rebook the cancelled appointment
      const rebooked = await this.prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          status: 'BOOKED',
          bookedAt: new Date(),
          cancelledAt: null,
        },
        include: {
          schedule: true,
          property: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return this.formatAppointmentResponse(rebooked);
    }

    // Create new appointment
    const appointment = await this.prisma.appointment.create({
      data: {
        scheduleId,
        propertyId: schedule.propertyId,
        userId,
        status: 'BOOKED',
      },
      include: {
        schedule: true,
        property: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatAppointmentResponse(appointment);
  }

  async findAll(query: QueryAppointmentsDto): Promise<{
    data: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      userId,
      propertyId,
      scheduleId,
      status,
      upcomingOnly,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.AppointmentWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (scheduleId) {
      where.scheduleId = scheduleId;
    }

    if (status && status !== 'ALL') {
      where.status = status as AppointmentStatus;
    }

    if (upcomingOnly) {
      where.schedule = {
        dateTime: {
          gte: new Date(),
        },
      };
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          schedule: true,
          property: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return {
      data: appointments.map((appointment) => this.formatAppointmentResponse(appointment)),
      total,
      page,
      limit,
    };
  }

  async findAllForClient(userId: string, query: QueryAppointmentsDto): Promise<{
    data: AppointmentResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    // Force userId filter for clients
    const clientQuery = { ...query, userId };
    return this.findAll(clientQuery);
  }

  async findOne(id: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        schedule: true,
        property: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.formatAppointmentResponse(appointment);
  }

  async cancel(id: string, userId: string, isAdmin: boolean = false): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        schedule: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Check ownership if not admin
    if (!isAdmin && appointment.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('Appointment is already cancelled');
    }

    // Optional: Check if appointment is in the past
    if (appointment.schedule.dateTime <= new Date()) {
      throw new BadRequestException('Cannot cancel past appointments');
    }

    const cancelled = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
      include: {
        schedule: true,
        property: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return this.formatAppointmentResponse(cancelled);
  }

  private formatAppointmentResponse(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      scheduleId: appointment.scheduleId,
      propertyId: appointment.propertyId,
      propertyName: appointment.property?.name,
      userId: appointment.userId,
      clientName: appointment.user?.name,
      clientEmail: appointment.user?.email,
      scheduleDateTime: appointment.schedule?.dateTime,
      scheduleLocation: appointment.schedule?.location,
      scheduleMessage: appointment.schedule?.message,
      status: appointment.status,
      bookedAt: appointment.bookedAt,
      cancelledAt: appointment.cancelledAt,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
}
