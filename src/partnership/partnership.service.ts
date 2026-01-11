import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { Partnership, PartnershipStatus, EnrollmentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PartnershipService {
  private readonly logger = new Logger(PartnershipService.name);
  private readonly clientAppUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.clientAppUrl = this.configService.get<string>('CLIENT_APP_URL') || 'https://app.example.com';
  }

  private generatePartnerLink(userId: string): string {
    // Generate unique partner link token
    const token = crypto.randomBytes(16).toString('hex');
    return `${token}-${userId.substring(0, 8)}`;
  }

  async applyForPartnership(userId: string): Promise<Partnership> {
    // Get client
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check if user has approved KYC
    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
    });

    if (!kyc || kyc.status !== 'APPROVED') {
      throw new BadRequestException(
        'KYC verification required. Please complete and get your KYC approved before applying for partnership.',
      );
    }

    // Check for existing partnership
    const existing = await this.prisma.partnership.findUnique({
      where: { clientId: client.id },
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
        where: { clientId: client.id },
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
        clientId: client.id,
        status: PartnershipStatus.AWAITING_APPROVAL,
        appliedAt: new Date(),
      },
    });

    this.logger.log(`User ${userId} applied for partnership`);
    return partnership;
  }

  async getMyPartnership(userId: string): Promise<any> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return null;
    }

    const partnership = await this.prisma.partnership.findUnique({
      where: { clientId: client.id },
      include: {
        client: {
          select: {
            partnerLink: true,
          },
        },
      },
    });

    if (!partnership) {
      return null;
    }

    const isSuspended = !!partnership.suspendedAt;
    const isLinkActive = partnership.status === PartnershipStatus.APPROVED && !isSuspended;
    const partnerLink = isLinkActive && partnership.client.partnerLink
      ? `${this.clientAppUrl}/signup?ref=${partnership.client.partnerLink}`
      : null;

    return {
      ...partnership,
      user: undefined,
      partnerLink,
      isSuspended,
      isLinkActive,
    };
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
      where.client = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.partnership.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
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
        client: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        reviewer: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
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

    // Generate unique partner link
    const partnerLink = this.generatePartnerLink(partnership.clientId);

    // Update both partnership and client
    const [updated] = await this.prisma.$transaction([
      this.prisma.partnership.update({
        where: { id },
        data: {
          status: PartnershipStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
        },
      }),
      this.prisma.client.update({
        where: { id: partnership.clientId },
        data: {
          partnerLink,
        },
      }),
    ]);

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

  async suspendPartnership(id: string, adminId: string): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (partnership.status !== PartnershipStatus.APPROVED) {
      throw new BadRequestException('Only approved partnerships can be suspended');
    }

    if (partnership.suspendedAt) {
      throw new BadRequestException('Partnership is already suspended');
    }

    const updated = await this.prisma.partnership.update({
      where: { id },
      data: {
        suspendedAt: new Date(),
        suspendedBy: adminId,
      },
    });

    this.logger.log(`Partnership ${id} suspended by admin ${adminId}`);
    return updated;
  }

  async unsuspendPartnership(id: string, adminId: string): Promise<Partnership> {
    const partnership = await this.prisma.partnership.findUnique({
      where: { id },
    });

    if (!partnership) {
      throw new NotFoundException('Partnership not found');
    }

    if (!partnership.suspendedAt) {
      throw new BadRequestException('Partnership is not suspended');
    }

    const updated = await this.prisma.partnership.update({
      where: { id },
      data: {
        suspendedAt: null,
        suspendedBy: null,
      },
    });

    this.logger.log(`Partnership ${id} unsuspended by admin ${adminId}`);
    return updated;
  }

  async getPartnerClients(
    partnerId: string,
    search?: string,
    enrollmentStatus?: EnrollmentStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      referredByPartnerId: partnerId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        select: {
          id: true,
          user: { select: { email: true } },
          name: true,
          createdAt: true,
          enrollmentsAsClient: {
            where: enrollmentStatus ? { status: enrollmentStatus } : {},
            select: {
              id: true,
              status: true,
              totalAmount: true,
              amountPaid: true,
            },
          },
          partnerCommissions: {
            where: {
              partnerId,
            },
            select: {
              amount: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    const data = clients.map((client) => {
      const totalEnrollments = client.enrollmentsAsClient.length;
      const activeEnrollments = client.enrollmentsAsClient.filter(
        (e) => e.status === EnrollmentStatus.ONGOING,
      ).length;
      const totalRevenue = client.enrollmentsAsClient.reduce(
        (sum, e) => sum + Number(e.amountPaid),
        0,
      );
      const totalCommissions = client.partnerCommissions.reduce(
        (sum, c) => sum + Number(c.amount),
        0,
      );
      const paidCommissions = client.partnerCommissions
        .filter((c) => c.status === 'PAID')
        .reduce((sum, c) => sum + Number(c.amount), 0);
      const pendingCommissions = totalCommissions - paidCommissions;

      return {
        id: client.id,
        email: client.user.email,
        name: client.name,
        createdAt: client.createdAt,
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        totalCommissions,
        paidCommissions,
        pendingCommissions,
      };
    });

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPartnerClientDetail(partnerId: string, clientId: string) {
    const client = await this.prisma.client.findFirst({
      where: {
        id: clientId,
        referredByPartnerId: partnerId,
      },
      select: {
        id: true,
        user: { select: { email: true } },
        name: true,
        createdAt: true,
        enrollmentsAsClient: {
          select: {
            id: true,
            status: true,
            totalAmount: true,
            amountPaid: true,
            enrollmentDate: true,
            property: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { enrollmentDate: 'desc' },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found or not referred by this partner');
    }

    const commissions = await this.prisma.commission.findMany({
      where: {
        partnerId,
        enrollment: {
          clientId,
        },
      },
      select: {
        id: true,
        enrollmentId: true,
        amount: true,
        status: true,
        createdAt: true,
        paidAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalRevenue = client.enrollmentsAsClient.reduce(
      (sum, e) => sum + Number(e.amountPaid),
      0,
    );
    const totalCommissions = commissions.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );
    const paidCommissions = commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingCommissions = totalCommissions - paidCommissions;

    return {
      id: client.id,
      email: client.user.email,
      name: client.name,
      createdAt: client.createdAt,
      enrollments: client.enrollmentsAsClient.map((e) => ({
        id: e.id,
        propertyName: e.property.name,
        status: e.status,
        totalAmount: Number(e.totalAmount),
        amountPaid: Number(e.amountPaid),
        enrollmentDate: e.enrollmentDate,
      })),
      commissions: commissions.map((c) => ({
        id: c.id,
        enrollmentId: c.enrollmentId,
        amount: Number(c.amount),
        status: c.status,
        createdAt: c.createdAt,
        paidAt: c.paidAt,
      })),
      totalRevenue,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
    };
  }

  async getPartnerDashboard(partnerId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get total clients referred by partner
    const totalClients = await this.prisma.client.count({
      where: { referredByPartnerId: partnerId },
    });

    // Get new clients this month
    const newClientsThisMonth = await this.prisma.client.count({
      where: {
        referredByPartnerId: partnerId,
        createdAt: { gte: startOfMonth },
      },
    });

    // Get enrollments for referred clients
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        client: {
          referredByPartnerId: partnerId,
        },
      },
      select: {
        id: true,
        status: true,
        amountPaid: true,
        enrollmentDate: true,
      },
    });

    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.ONGOING,
    ).length;
    const completedEnrollments = enrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED,
    ).length;
    const newEnrollmentsThisMonth = enrollments.filter(
      (e) => e.enrollmentDate >= startOfMonth,
    ).length;
    const totalRevenue = enrollments.reduce(
      (sum, e) => sum + Number(e.amountPaid),
      0,
    );

    // Get commissions
    const commissions = await this.prisma.commission.findMany({
      where: {
        partnerId,
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    const totalCommissionsEarned = commissions.reduce(
      (sum, c) => sum + Number(c.amount),
      0,
    );
    const paidCommissions = commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + Number(c.amount), 0);
    const pendingCommissions = totalCommissionsEarned - paidCommissions;

    // Calculate monthly revenue for last 6 months
    const monthlyRevenueMap = new Map<string, { revenue: number; commissions: number }>();

    enrollments.forEach((e) => {
      const monthKey = `${e.enrollmentDate.getFullYear()}-${String(e.enrollmentDate.getMonth() + 1).padStart(2, '0')}`;
      if (e.enrollmentDate >= last6Months) {
        const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, commissions: 0 };
        existing.revenue += Number(e.amountPaid);
        monthlyRevenueMap.set(monthKey, existing);
      }
    });

    commissions.forEach((c) => {
      const monthKey = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (c.createdAt >= last6Months) {
        const existing = monthlyRevenueMap.get(monthKey) || { revenue: 0, commissions: 0 };
        existing.commissions += Number(c.amount);
        monthlyRevenueMap.set(monthKey, existing);
      }
    });

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        commissions: data.commissions,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalClients,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalRevenue,
      totalCommissionsEarned,
      paidCommissions,
      pendingCommissions,
      monthlyRevenue,
      newClientsThisMonth,
      newEnrollmentsThisMonth,
    };
  }
}
