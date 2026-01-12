import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateSalesTargetDto } from './dto/create-sales-target.dto';
import { UpdateSalesTargetDto } from './dto/update-sales-target.dto';
import { BatchCreateTargetsDto } from './dto/batch-create-targets.dto';
import { QuerySalesTargetsDto } from './dto/query-sales-targets.dto';
import { SalesTargetResponseDto } from './dto/sales-target-response.dto';
import { TargetStatsDto } from './dto/target-stats.dto';
import { TargetAchievementDto } from './dto/target-achievement.dto';
import { BatchCreateResponseDto } from './dto/batch-create-response.dto';
import { Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class SalesTargetsService {
  constructor(private prisma: PrismaService) {}

  // Helper method to validate target period for overlaps
  private async validateTargetPeriod(
    adminId: string,
    startDate: Date,
    endDate: Date,
    excludeTargetId?: string,
  ): Promise<void> {
    if (startDate >= endDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping targets for the same admin
    const overlappingTarget = await this.prisma.salesTarget.findFirst({
      where: {
        adminId,
        id: excludeTargetId ? { not: excludeTargetId } : undefined,
        OR: [
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: startDate } },
            ],
          },
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: endDate } },
            ],
          },
          {
            AND: [
              { startDate: { gte: startDate } },
              { endDate: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlappingTarget) {
      throw new BadRequestException(
        `Target already exists for this user during the specified period (${overlappingTarget.startDate.toISOString().split('T')[0]} to ${overlappingTarget.endDate.toISOString().split('T')[0]})`,
      );
    }
  }

  // Helper method to calculate achievement amount for an admin within a period
  private async calculateAchievement(
    adminId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Sum all completed enrollments for the admin within the period
    const result = await this.prisma.enrollment.aggregate({
      where: {
        agentId: adminId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    return Number(result._sum.totalAmount || 0);
  }

  // Helper method to format target response
  private formatTargetResponse(target: any): SalesTargetResponseDto {
    const now = new Date();
    const isActive =
      new Date(target.startDate) <= now && new Date(target.endDate) >= now;
    const achievementPercentage =
      Number(target.targetAmount) > 0
        ? (Number(target.achievedAmount) / Number(target.targetAmount)) * 100
        : 0;

    return {
      id: target.id,
      userId: target.adminId,
      userName: target.admin?.name || 'N/A',
      userEmail: target.admin?.user?.email || 'N/A',
      targetAmount: Number(target.targetAmount),
      achievedAmount: Number(target.achievedAmount),
      achievementPercentage: Math.round(achievementPercentage * 100) / 100,
      startDate: target.startDate.toISOString(),
      endDate: target.endDate.toISOString(),
      isActive,
      createdBy: target.createdBy,
      createdAt: target.createdAt.toISOString(),
      updatedAt: target.updatedAt.toISOString(),
    };
  }

  // Create single target
  async create(
    createTargetDto: CreateSalesTargetDto,
    createdById: string,
  ): Promise<SalesTargetResponseDto> {
    const { email, targetAmount, startDate, endDate } = createTargetDto;

    // Find admin by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        admin: true,
      },
    });

    if (!user || !user.admin) {
      throw new NotFoundException(`Admin with email ${email} not found`);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate period
    await this.validateTargetPeriod(user.admin.id, start, end);

    // Create target
    const target = await this.prisma.salesTarget.create({
      data: {
        adminId: user.admin.id,
        targetAmount,
        startDate: start,
        endDate: end,
        createdBy: createdById,
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return this.formatTargetResponse(target);
  }

  // Batch create targets
  async batchCreate(
    batchDto: BatchCreateTargetsDto,
    createdById: string,
  ): Promise<BatchCreateResponseDto> {
    const success: SalesTargetResponseDto[] = [];
    const failures: any[] = [];

    for (let i = 0; i < batchDto.targets.length; i++) {
      const targetDto = batchDto.targets[i];
      try {
        const result = await this.create(targetDto, createdById);
        success.push(result);
      } catch (error) {
        failures.push({
          index: i,
          email: targetDto.email,
          error: error.message,
        });
      }
    }

    return {
      success,
      failures,
      successCount: success.length,
      failureCount: failures.length,
    };
  }

  // Get all targets with pagination and filters
  async findAll(query: QuerySalesTargetsDto): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search,
      userId,
      startDateFrom,
      startDateTo,
      endDateFrom,
      endDateTo,
      status,
    } = query;

    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause
    const where: Prisma.SalesTargetWhereInput = {
      ...(userId && { adminId: userId }),
      ...(search && {
        admin: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { otherName: { contains: search, mode: 'insensitive' } },
            {
              user: {
                email: { contains: search, mode: 'insensitive' },
              },
            },
          ],
        },
      }),
      ...(startDateFrom && { startDate: { gte: new Date(startDateFrom) } }),
      ...(startDateTo && { startDate: { lte: new Date(startDateTo) } }),
      ...(endDateFrom && { endDate: { gte: new Date(endDateFrom) } }),
      ...(endDateTo && { endDate: { lte: new Date(endDateTo) } }),
      ...(status === 'active' && {
        startDate: { lte: now },
        endDate: { gte: now },
      }),
      ...(status === 'completed' && {
        endDate: { lt: now },
      }),
    };

    const [targets, total] = await Promise.all([
      this.prisma.salesTarget.findMany({
        where,
        skip,
        take: limit,
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.salesTarget.count({ where }),
    ]);

    const data = targets.map((target) => this.formatTargetResponse(target));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single target by ID
  async findOne(id: string): Promise<SalesTargetResponseDto> {
    const target = await this.prisma.salesTarget.findUnique({
      where: { id },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!target) {
      throw new NotFoundException(`Sales target with ID ${id} not found`);
    }

    return this.formatTargetResponse(target);
  }

  // Update target
  async update(
    id: string,
    updateDto: UpdateSalesTargetDto,
  ): Promise<SalesTargetResponseDto> {
    const existing = await this.prisma.salesTarget.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Sales target with ID ${id} not found`);
    }

    const startDate = updateDto.startDate
      ? new Date(updateDto.startDate)
      : existing.startDate;
    const endDate = updateDto.endDate
      ? new Date(updateDto.endDate)
      : existing.endDate;

    // Validate period if dates are being updated
    if (updateDto.startDate || updateDto.endDate) {
      await this.validateTargetPeriod(existing.adminId, startDate, endDate, id);
    }

    const updated = await this.prisma.salesTarget.update({
      where: { id },
      data: {
        ...(updateDto.targetAmount && { targetAmount: updateDto.targetAmount }),
        ...(updateDto.startDate && { startDate }),
        ...(updateDto.endDate && { endDate }),
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return this.formatTargetResponse(updated);
  }

  // Delete target (archive to Achievement)
  async remove(id: string): Promise<{ message: string }> {
    const target = await this.prisma.salesTarget.findUnique({
      where: { id },
    });

    if (!target) {
      throw new NotFoundException(`Sales target with ID ${id} not found`);
    }

    // Archive to Achievement model
    await this.prisma.achievement.create({
      data: {
        adminId: target.adminId,
        targetAmount: target.targetAmount,
        achievedAmount: target.achievedAmount,
        startDate: target.startDate,
        endDate: target.endDate,
      },
    });

    // Delete the target
    await this.prisma.salesTarget.delete({
      where: { id },
    });

    return { message: 'Target deleted and achievement archived successfully' };
  }

  // Get my targets (for agents)
  async getMyTargets(
    adminId: string,
    query: QuerySalesTargetsDto,
  ): Promise<any> {
    return this.findAll({ ...query, userId: adminId });
  }

  // Get my current active target
  async getMyCurrent(adminId: string): Promise<SalesTargetResponseDto | null> {
    const now = new Date();

    const target = await this.prisma.salesTarget.findFirst({
      where: {
        adminId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return target ? this.formatTargetResponse(target) : null;
  }

  // Get my stats
  async getMyStats(adminId: string): Promise<TargetStatsDto> {
    const targets = await this.prisma.salesTarget.findMany({
      where: { adminId },
    });

    const now = new Date();
    const activeTargets = targets.filter(
      (t) => t.startDate <= now && t.endDate >= now,
    );
    const completedTargets = targets.filter((t) => t.endDate < now);
    const achievedTargets = targets.filter(
      (t) => Number(t.achievedAmount) >= Number(t.targetAmount),
    );
    const pendingTargets = targets.filter(
      (t) => Number(t.achievedAmount) < Number(t.targetAmount),
    );

    const totalTargetAmount = targets.reduce(
      (sum, t) => sum + Number(t.targetAmount),
      0,
    );
    const totalAchievedAmount = targets.reduce(
      (sum, t) => sum + Number(t.achievedAmount),
      0,
    );

    const overallAchievementPercentage =
      totalTargetAmount > 0
        ? (totalAchievedAmount / totalTargetAmount) * 100
        : 0;

    return {
      totalTargets: targets.length,
      activeTargets: activeTargets.length,
      completedTargets: completedTargets.length,
      achievedTargets: achievedTargets.length,
      pendingTargets: pendingTargets.length,
      totalTargetAmount,
      totalAchievedAmount,
      overallAchievementPercentage:
        Math.round(overallAchievementPercentage * 100) / 100,
    };
  }

  // Get overall stats (admin)
  async getStats(): Promise<TargetStatsDto> {
    const targets = await this.prisma.salesTarget.findMany();

    const now = new Date();
    const activeTargets = targets.filter(
      (t) => t.startDate <= now && t.endDate >= now,
    );
    const completedTargets = targets.filter((t) => t.endDate < now);
    const achievedTargets = targets.filter(
      (t) => Number(t.achievedAmount) >= Number(t.targetAmount),
    );
    const pendingTargets = targets.filter(
      (t) => Number(t.achievedAmount) < Number(t.targetAmount),
    );

    const totalTargetAmount = targets.reduce(
      (sum, t) => sum + Number(t.targetAmount),
      0,
    );
    const totalAchievedAmount = targets.reduce(
      (sum, t) => sum + Number(t.achievedAmount),
      0,
    );

    const overallAchievementPercentage =
      totalTargetAmount > 0
        ? (totalAchievedAmount / totalTargetAmount) * 100
        : 0;

    return {
      totalTargets: targets.length,
      activeTargets: activeTargets.length,
      completedTargets: completedTargets.length,
      achievedTargets: achievedTargets.length,
      pendingTargets: pendingTargets.length,
      totalTargetAmount,
      totalAchievedAmount,
      overallAchievementPercentage:
        Math.round(overallAchievementPercentage * 100) / 100,
    };
  }

  // Get achievement history for an admin
  async getAchievementHistory(adminId: string): Promise<TargetAchievementDto[]> {
    const achievements = await this.prisma.achievement.findMany({
      where: { adminId },
      orderBy: { achievedAt: 'desc' },
    });

    return achievements.map((achievement) => {
      const achievementPercentage =
        Number(achievement.targetAmount) > 0
          ? (Number(achievement.achievedAmount) /
              Number(achievement.targetAmount)) *
            100
          : 0;

      return {
        id: achievement.id,
        userId: achievement.adminId,
        targetAmount: Number(achievement.targetAmount),
        achievedAmount: Number(achievement.achievedAmount),
        achievementPercentage:
          Math.round(achievementPercentage * 100) / 100,
        startDate: achievement.startDate.toISOString(),
        endDate: achievement.endDate.toISOString(),
        achievedAt: achievement.achievedAt.toISOString(),
        createdAt: achievement.createdAt.toISOString(),
      };
    });
  }

  // Cron job to update achievements daily
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateAchievements() {
    const activeTargets = await this.prisma.salesTarget.findMany({
      where: {
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    for (const target of activeTargets) {
      const achievedAmount = await this.calculateAchievement(
        target.adminId,
        target.startDate,
        target.endDate,
      );

      await this.prisma.salesTarget.update({
        where: { id: target.id },
        data: { achievedAmount },
      });
    }
  }

  // Cron job to auto-archive expired targets
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async archiveExpiredTargets() {
    const now = new Date();
    const expiredTargets = await this.prisma.salesTarget.findMany({
      where: {
        endDate: { lt: now },
      },
    });

    for (const target of expiredTargets) {
      // Check if already archived
      const existing = await this.prisma.achievement.findFirst({
        where: {
          adminId: target.adminId,
          startDate: target.startDate,
          endDate: target.endDate,
        },
      });

      if (!existing) {
        await this.prisma.achievement.create({
          data: {
            adminId: target.adminId,
            targetAmount: target.targetAmount,
            achievedAmount: target.achievedAmount,
            startDate: target.startDate,
            endDate: target.endDate,
          },
        });
      }
    }
  }
}
