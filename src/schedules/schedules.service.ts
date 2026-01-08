import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { QuerySchedulesDto } from './dto/query-schedules.dto';
import { ScheduleResponseDto } from './dto/schedule-response.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchedulesService {
  constructor(private prisma: PrismaService) {}

  async create(
    createScheduleDto: CreateScheduleDto,
    userId: string,
  ): Promise<ScheduleResponseDto> {
    const { propertyId, dateTime, location, message } = createScheduleDto;

    // Validate property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Validate dateTime is in the future
    const scheduledDateTime = new Date(dateTime);
    if (scheduledDateTime <= new Date()) {
      throw new BadRequestException('Schedule date/time must be in the future');
    }

    const schedule = await this.prisma.schedule.create({
      data: {
        propertyId,
        dateTime: scheduledDateTime,
        location,
        message,
        createdBy: userId,
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return this.formatScheduleResponse(schedule);
  }

  async findAll(query: QuerySchedulesDto): Promise<{
    data: ScheduleResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      search,
      propertyId,
      createdBy,
      dateTimeFrom,
      dateTimeTo,
      upcomingOnly,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ScheduleWhereInput = {};

    if (search) {
      where.location = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (createdBy) {
      where.createdBy = createdBy;
    }

    if (dateTimeFrom || dateTimeTo || upcomingOnly) {
      where.dateTime = {};

      if (dateTimeFrom) {
        where.dateTime.gte = new Date(dateTimeFrom);
      }

      if (dateTimeTo) {
        where.dateTime.lte = new Date(dateTimeTo);
      }

      if (upcomingOnly) {
        where.dateTime.gte = new Date();
      }
    }

    const [schedules, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          dateTime: 'asc',
        },
        include: {
          property: {
            select: {
              name: true,
            },
          },
          creator: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      }),
      this.prisma.schedule.count({ where }),
    ]);

    return {
      data: schedules.map((schedule) => this.formatScheduleResponse(schedule)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<ScheduleResponseDto> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.formatScheduleResponse(schedule);
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
    userId: string,
  ): Promise<ScheduleResponseDto> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Optional: Check if user is authorized to update (creator or admin)
    // This would typically be handled by guards, but adding as additional check

    const { dateTime, location, message } = updateScheduleDto;

    // Validate dateTime is in the future if provided
    if (dateTime) {
      const scheduledDateTime = new Date(dateTime);
      if (scheduledDateTime <= new Date()) {
        throw new BadRequestException('Schedule date/time must be in the future');
      }
    }

    const updated = await this.prisma.schedule.update({
      where: { id },
      data: {
        ...(dateTime && { dateTime: new Date(dateTime) }),
        ...(location && { location }),
        ...(message !== undefined && { message }),
      },
      include: {
        property: {
          select: {
            name: true,
          },
        },
        creator: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return this.formatScheduleResponse(updated);
  }

  async remove(id: string, userId: string): Promise<{ message: string; cancelledAppointments: number }> {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: 'BOOKED',
              },
            },
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    const bookedAppointmentsCount = schedule._count.appointments;

    // Delete will cascade and cancel all appointments
    await this.prisma.schedule.delete({
      where: { id },
    });

    return {
      message: 'Schedule deleted successfully',
      cancelledAppointments: bookedAppointmentsCount,
    };
  }

  private formatScheduleResponse(schedule: any): ScheduleResponseDto {
    return {
      id: schedule.id,
      propertyId: schedule.propertyId,
      propertyName: schedule.property?.name,
      dateTime: schedule.dateTime,
      location: schedule.location,
      message: schedule.message,
      appointmentsCount: schedule._count?.appointments || 0,
      createdBy: schedule.createdBy,
      creatorName: schedule.creator?.name,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt,
    };
  }
}
