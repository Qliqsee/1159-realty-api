import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Partnership, PartnershipStatus } from '@prisma/client';

@Injectable()
export class PartnershipService {
  private readonly logger = new Logger(PartnershipService.name);

  constructor(private prisma: PrismaService) {}

  async applyForPartnership(userId: string): Promise<Partnership> {
    // Check if user has approved KYC
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw new BadRequestException(
        'KYC verification required. Please complete and get your KYC approved before applying for partnership.',
      );
    }

    // Check for existing partnership
    const existing = await this.prisma.partnership.findUnique({
      where: { userId },
    });

    if (existing) {
      // Check if currently in cooldown period
      if (
        existing.status === PartnershipStatus.REJECTED &&
        existing.rejectionCooldown &&
        new Date() < existing.rejectionCooldown
      ) {
        const daysRemaining = Math.ceil(
          (existing.rejectionCooldown.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        );
        throw new BadRequestException(
          `You are in a cooldown period. You can reapply in ${daysRemaining} day(s).`,
        );
      }

      // If already approved
      if (existing.status === PartnershipStatus.APPROVED) {
        throw new BadRequestException('You are already a partner.');
      }

      // If already awaiting approval
      if (existing.status === PartnershipStatus.AWAITING_APPROVAL) {
        throw new BadRequestException(
          'Your partnership application is already pending review.',
        );
      }

      // Reapply after cooldown or if status was NONE/REJECTED
      const updated = await this.prisma.partnership.update({
        where: { userId },
        data: {
          status: PartnershipStatus.AWAITING_APPROVAL,
          appliedAt: new Date(),
          reviewedAt: null,
          reviewedBy: null,
          rejectedAt: null,
          rejectionCooldown: null,
        },
      });

      this.logger.log(`User ${userId} reapplied for partnership`);
      return updated;
    }

    // Create new partnership application
    const partnership = await this.prisma.partnership.create({
      data: {
        userId,
        status: PartnershipStatus.AWAITING_APPROVAL,
        appliedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} applied for partnership`);
    return partnership;
  }

  async getMyPartnership(userId: string): Promise<Partnership | null> {
    return this.prisma.partnership.findUnique({
      where: { userId },
    });
  }

  async listPartnerships(
    search?: string,
    status?: PartnershipStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.partnership.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnership.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPartnershipById(id: string) {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    return partnership;
  }

  async approvePartnership(id: string, adminId: string): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.status !== PartnershipStatus.AWAITING_APPROVAL) {
      throw new BadRequestException(
        'Only pending partnership applications can be approved',
      );
    }

    const updated = await this.prisma.partnership.update({
      where: { id },
      data: {
        status: PartnershipStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
    });

    this.logger.log(`Partnership ${id} approved by admin ${adminId}`);
    return updated;
  }

  async rejectPartnership(id: string, adminId: string): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.status !== PartnershipStatus.AWAITING_APPROVAL) {
      throw new BadRequestException(
        'Only pending partnership applications can be rejected',
      );
    }

    // Calculate 90-day cooldown
    const cooldownDate = new Date();
    cooldownDate.setDate(cooldownDate.getDate() + 90);

    const updated = await this.prisma.partnership.update({
      where: { id },
      data: {
        status: PartnershipStatus.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: adminId,
        rejectedAt: new Date(),
        rejectionCooldown: cooldownDate,
      },
    });

    this.logger.log(`Partnership ${id} rejected by admin ${adminId}`);
    return updated;
  }
}
