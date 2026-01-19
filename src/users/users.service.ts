import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserQueryDto, MyClientsQueryDto, UserSortOption } from './dto/user-query.dto';
import {
  UserDetailsResponseDto,
  UserStatsResponseDto,
  MyStatsResponseDto,
  ReferralInfoResponseDto,
  EnrollmentSummaryDto,
  KYCInfoDto,
  PartnershipInfoDto,
  LeadConversionInfoDto,
} from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * DEPRECATED: The following methods are commented out because the User model schema changed.
   * User fields like name, phone, gender, country, state, bank details, kyc, partnership,
   * enrollmentsAsClient, closedBy, etc. have been moved to Admin and Client tables.
   *
   * These methods will be replaced by dedicated endpoints in the Admin and Client modules.
   *
   * Uncomment and refactor these methods if needed to query both Admin and Client tables.
   */

  /* COMMENTED OUT - Schema migration: User fields moved to Admin/Client tables
  async findAll(query?: UserQueryDto) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    // Search
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (query?.roleId) {
      where.userRoles = {
        some: {
          roleId: query.roleId,
        },
      };
    }

    if (query?.emailVerified) {
      where.isEmailVerified = query.emailVerified === 'true';
    }

    if (query?.gender) {
      where.gender = query.gender;
    }

    if (query?.country) {
      where.country = query.country;
    }

    if (query?.state) {
      where.state = query.state;
    }

    if (query?.isSuspended) {
      where.isSuspended = query.isSuspended === 'true';
    }

    // Exclude filters
    if (query?.excludeClient === 'true') {
      where.userRoles = {
        ...where.userRoles,
        none: {
          role: {
            name: 'client',
          },
        },
      };
    }

    if (query?.excludePartners === 'true') {
      where.partnership = null;
    }

    if (query?.excludeAdmin === 'true') {
      where.userRoles = {
        ...where.userRoles,
        none: {
          role: {
            name: { in: ['admin', 'manager', 'HR'] },
          },
        },
      };
    }

    if (query?.hasCompletedKYC === 'true') {
      where.kyc = {
        status: 'APPROVED',
      };
    } else if (query?.hasCompletedKYC === 'false') {
      where.OR = [
        { kyc: null },
        { kyc: { status: { not: 'APPROVED' } } },
      ];
    }

    // Sorting
    switch (query?.sort) {
      case UserSortOption.OLDEST:
        orderBy.createdAt = 'asc';
        break;
      case UserSortOption.MOST_SPENT:
        // For most spent, we'll need to do a subquery or post-process
        // For now, default to latest
        orderBy.createdAt = 'desc';
        break;
      case UserSortOption.LATEST:
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          gender: true,
          country: true,
          state: true,
          createdAt: true,
          isEmailVerified: true,
          isSuspended: true,
          userRoles: {
            include: {
              role: true,
            },
          },
          partnership: {
            select: {
              status: true,
            },
          },
          kyc: {
            select: {
              status: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<UserDetailsResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        kyc: true,
        partnership: true,
        lead: true,
        closedByAgent: {
          select: {
            id: true,
            name: true,
          },
        },
        referredByPartner: {
          select: {
            id: true,
            name: true,
          },
        },
        enrollmentsAsClient: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
              },
            },
            agent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.buildUserDetails(user);
  }

  async getProfile(userId: string): Promise<UserDetailsResponseDto> {
    return this.findOne(userId);
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
    const [
      totalUsers,
      totalMale,
      totalFemale,
      totalPartners,
      totalAgents,
      totalClients,
      totalActive,
      totalSuspended,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { gender: 'MALE' } }),
      this.prisma.user.count({ where: { gender: 'FEMALE' } }),
      this.prisma.partnership.count({ where: { status: 'APPROVED' } }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: 'agent',
              },
            },
          },
        },
      }),
      this.prisma.user.count({
        where: {
          userRoles: {
            some: {
              role: {
                name: 'client',
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where: { isSuspended: false } }),
      this.prisma.user.count({ where: { isSuspended: true } }),
    ]);

    return {
      totalUsers,
      totalMale,
      totalFemale,
      totalPartners,
      totalAgents,
      totalClients,
      totalActive,
      totalSuspended,
    };
  }

  async getMyClients(agentId: string, query?: MyClientsQueryDto) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        // Clients from enrollments
        {
          enrollmentsAsClient: {
            some: {
              agentId,
            },
          },
        },
        // Clients from closed leads
        {
          closedBy: agentId,
        },
      ],
    };

    // Search
    if (query?.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
    }

    // Filters
    if (query?.gender) {
      where.gender = query.gender;
    }

    if (query?.country) {
      where.country = query.country;
    }

    if (query?.state) {
      where.state = query.state;
    }

    if (query?.hasCompletedKYC === 'true') {
      where.kyc = {
        status: 'APPROVED',
      };
    } else if (query?.hasCompletedKYC === 'false') {
      where.OR = [
        ...(where.OR || []),
        { kyc: null },
        { kyc: { status: { not: 'APPROVED' } } },
      ];
    }

    if (query?.excludeAgents === 'true') {
      where.userRoles = {
        none: {
          role: {
            name: 'agent',
          },
        },
      };
    }

    if (query?.excludePartners === 'true') {
      where.partnership = null;
    }

    // Sorting
    const orderBy: any = {};
    switch (query?.sort) {
      case UserSortOption.OLDEST:
        orderBy.createdAt = 'asc';
        break;
      case UserSortOption.LATEST:
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          gender: true,
          country: true,
          state: true,
          createdAt: true,
          isEmailVerified: true,
          isSuspended: true,
          userRoles: {
            include: {
              role: true,
            },
          },
          partnership: {
            select: {
              status: true,
            },
          },
          kyc: {
            select: {
              status: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMyStats(agentId: string): Promise<MyStatsResponseDto> {
    const clientWhere = {
      OR: [
        {
          enrollmentsAsClient: {
            some: {
              agentId,
            },
          },
        },
        {
          closedBy: agentId,
        },
      ],
    };

    const [totalClients, totalMale, totalFemale, totalPartners] = await Promise.all([
      this.prisma.user.count({ where: clientWhere }),
      this.prisma.user.count({
        where: {
          ...clientWhere,
          gender: 'MALE',
        },
      }),
      this.prisma.user.count({
        where: {
          ...clientWhere,
          gender: 'FEMALE',
        },
      }),
      this.prisma.user.count({
        where: {
          ...clientWhere,
          partnership: {
            status: 'APPROVED',
          },
        },
      }),
    ]);

    return {
      totalClients,
      totalMale,
      totalFemale,
      totalPartners,
    };
  }

  async getReferralInfo(userId: string): Promise<ReferralInfoResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        partnership: true,
        referredClients: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPartner = user.partnership?.status === 'APPROVED';
    const partnershipStatus = user.partnership?.status || 'NONE';

    return {
      partnerLink: isPartner ? user.partnerLink : undefined,
      referralCode: isPartner ? user.partnerLink?.split('/').pop() : undefined,
      totalReferredClients: user.referredClients?.length || 0,
      isPartner,
      partnershipStatus,
    };
  }

  async update(id: string, updateData: { name?: string; email?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async assignRole(userId: string, roleId: string, assignerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check role assignment hierarchy
    await this.checkRoleAssignmentPermission(assignerId, role.name);

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ForbiddenException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  async removeRole(userId: string, roleId: string, removerId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check role assignment hierarchy (same rules for removal)
    await this.checkRoleAssignmentPermission(removerId, role.name);

    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return { message: 'Role removed from user successfully' };
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleResources: {
                  include: {
                    resource: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.roleResources.map((rr) => ({
        resource: rr.resource.name,
        actions: rr.actions,
      }))
    );

    return permissions;
  }

  async canAgentAccessClient(agentId: string, clientId: string): Promise<boolean> {
    const hasAccess = await this.prisma.user.findFirst({
      where: {
        id: clientId,
        OR: [
          {
            enrollmentsAsClient: {
              some: {
                agentId,
              },
            },
          },
          {
            closedBy: agentId,
          },
        ],
      },
    });

    return !!hasAccess;
  }

  // Helper methods
  private async buildUserDetails(user: any): Promise<UserDetailsResponseDto> {
    const [totalSpent, enrollmentCounts, totalPending] = await Promise.all([
      this.calculateTotalSpent(user.id),
      this.getEnrollmentCounts(user.id),
      this.calculateTotalPending(user.id),
    ]);

    const enrollments = await this.getEnrollmentsSummary(user.id);
    const assignedAgent = this.getAssignedAgent(user.enrollmentsAsClient);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
      country: user.country,
      state: user.state,
      isEmailVerified: user.isEmailVerified,
      hasCompletedOnboarding: user.hasCompletedOnboarding,
      createdAt: user.createdAt,
      totalSpent,
      activeEnrollments: enrollmentCounts.active,
      completedEnrollments: enrollmentCounts.completed,
      kyc: this.getKYCInfo(user.kyc),
      leadConversion: this.getLeadConversionInfo(user),
      assignedAgentId: assignedAgent?.id,
      assignedAgentName: assignedAgent?.name,
      partnership: this.getPartnershipInfo(user),
      enrollments,
      isSuspended: user.isSuspended,
      roles: user.userRoles?.map((ur: any) => ur.role.name) || [],
      totalEnrollments: enrollmentCounts.total,
      totalPaid: totalSpent,
      totalPending,
    };
  }

  private async calculateTotalSpent(userId: string): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        enrollment: {
          clientId: userId,
        },
        status: 'PAID',
      },
      _sum: {
        amountPaid: true,
      },
    });

    return Number(result._sum.amountPaid || 0);
  }

  private async calculateTotalPending(userId: string): Promise<number> {
    const result = await this.prisma.invoice.aggregate({
      where: {
        enrollment: {
          clientId: userId,
        },
        status: { in: ['PENDING', 'OVERDUE'] },
      },
      _sum: {
        amount: true,
      },
    });

    return Number(result._sum.amount || 0);
  }

  private async getEnrollmentCounts(userId: string) {
    const [active, completed, total] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          clientId: userId,
          status: 'ONGOING',
        },
      }),
      this.prisma.enrollment.count({
        where: {
          clientId: userId,
          status: 'COMPLETED',
        },
      }),
      this.prisma.enrollment.count({
        where: {
          clientId: userId,
        },
      }),
    ]);

    return { active, completed, total };
  }

  private async getEnrollmentsSummary(userId: string): Promise<EnrollmentSummaryDto[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { clientId: userId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { enrollmentDate: 'desc' },
      take: 10,
    });

    return enrollments.map((e) => ({
      id: e.id,
      propertyName: e.property.name,
      propertyId: e.property.id,
      status: e.status,
      totalAmount: Number(e.totalAmount),
      amountPaid: Number(e.amountPaid),
      enrollmentDate: e.enrollmentDate,
    }));
  }

  private getKYCInfo(kyc: any): KYCInfoDto | undefined {
    if (!kyc) return undefined;

    return {
      status: kyc.status,
      currentStep: kyc.currentStep,
      submittedAt: kyc.submittedAt,
      reviewedAt: kyc.reviewedAt,
    };
  }

  private getPartnershipInfo(user: any): PartnershipInfoDto | undefined {
    if (!user.partnership) {
      return {
        status: 'NONE',
      };
    }

    return {
      status: user.partnership.status,
      partnerLink: user.partnerLink,
      referredByPartnerId: user.referredByPartnerId,
      referredByPartnerName: user.referredByPartner?.name,
    };
  }

  private getLeadConversionInfo(user: any): LeadConversionInfoDto | undefined {
    if (!user.leadId) return undefined;

    return {
      leadId: user.leadId,
      closedBy: user.closedBy,
      closedByAgentName: user.closedByAgent?.name,
    };
  }

  private getAssignedAgent(enrollments: any[]): { id: string; name: string } | undefined {
    if (!enrollments || enrollments.length === 0) return undefined;

    // Get the most recent enrollment's agent
    const sortedEnrollments = enrollments.sort(
      (a, b) => new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime()
    );

    const agent = sortedEnrollments[0]?.agent;
    return agent ? { id: agent.id, name: agent.name } : undefined;
  }

  // Bank Account Management
  async updateBankAccount(userId: string, bankData: { accountNumber: string; bankCode: string; accountName: string; bankName: string }) {
    // Here you would validate with Paystack Resolve Account API
    // For now, we'll just save the data
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountNumber: bankData.accountNumber,
        bankCode: bankData.bankCode,
        accountName: bankData.accountName,
        bankName: bankData.bankName,
      },
      select: {
        accountNumber: true,
        bankCode: true,
        accountName: true,
        bankName: true,
      },
    });

    return this.maskBankAccount(user);
  }

  async getBankAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        accountNumber: true,
        bankCode: true,
        accountName: true,
        bankName: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.accountNumber) {
      throw new NotFoundException('Bank account not configured');
    }

    return this.maskBankAccount(user);
  }

  async deleteBankAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountNumber: null,
        bankCode: null,
        accountName: null,
        bankName: null,
      },
    });

    return { message: 'Bank account deleted successfully' };
  }

  private maskBankAccount(user: any) {
    if (!user.accountNumber) {
      return null;
    }

    const masked = '****' + user.accountNumber.slice(-4);
    return {
      accountNumber: masked,
      bankCode: user.bankCode,
      accountName: user.accountName,
      bankName: user.bankName,
    };
  }
  */ // END COMMENTED OUT BLOCK - Schema migration

  // These methods still work with the new schema

  /* COMMENTED OUT - name and phone no longer on User table
  async update(id: string, updateData: { name?: string; email?: string; phone?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        updatedAt: true,
      },
    });
  }
  */

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    return { message: 'User deleted successfully' };
  }

  async assignRole(userId: string, roleId: string, assignerId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check role assignment hierarchy
    await this.checkRoleAssignmentPermission(assignerId, role.name);

    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ForbiddenException('User already has this role');
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
      },
    });
  }

  async removeRole(userId: string, roleId: string, removerId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check role assignment hierarchy (same rules for removal)
    await this.checkRoleAssignmentPermission(removerId, role.name);

    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException('User does not have this role');
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return { message: 'Role removed from user successfully' };
  }

  async getUserPermissions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                roleResources: {
                  include: {
                    resource: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.roleResources.map((rr) => ({
        resource: rr.resource.name,
        actions: rr.actions,
      }))
    );

    return permissions;
  }

  async banUser(userId: string, bannerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check ban hierarchy
    await this.checkBanPermission(bannerId, user.userRoles.map(ur => ur.role.name));

    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });

    return { message: 'User banned successfully' };
  }

  async unbanUser(userId: string, unbannerId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check ban hierarchy (same rules for unban)
    await this.checkBanPermission(unbannerId, user.userRoles.map(ur => ur.role.name));

    await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });

    return { message: 'User unbanned successfully' };
  }

  async suspendUser(userId: string, suspenderId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        admin: true,
        client: {
          include: {
            partnership: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only partners and admins can be suspended
    const isAdmin = !!user.admin;
    const isPartner = user.client?.partnership?.status === 'APPROVED';

    if (!isAdmin && !isPartner) {
      throw new ForbiddenException('Only partners and admins can be suspended');
    }

    // Check ban hierarchy (same rules for suspend)
    await this.checkBanPermission(suspenderId, user.userRoles.map(ur => ur.role.name));

    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
    });

    return { message: 'User suspended successfully' };
  }

  async unsuspendUser(userId: string, unsuspenderId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        admin: true,
        client: {
          include: {
            partnership: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only partners and admins can be suspended
    const isAdmin = !!user.admin;
    const isPartner = user.client?.partnership?.status === 'APPROVED';

    if (!isAdmin && !isPartner) {
      throw new ForbiddenException('Only partners and admins can be suspended');
    }

    // Check ban hierarchy (same rules for unsuspend)
    await this.checkBanPermission(unsuspenderId, user.userRoles.map(ur => ur.role.name));

    await this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
    });

    return { message: 'User unsuspended successfully' };
  }

  // Helper method to check role assignment permission
  private async checkRoleAssignmentPermission(assignerId: string, roleName: string) {
    // Admin role cannot be assigned by anyone
    if (roleName === 'admin') {
      throw new ForbiddenException('Admin role cannot be assigned');
    }

    // Get assigner's roles
    const assigner = await this.prisma.user.findUnique({
      where: { id: assignerId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!assigner) {
      throw new NotFoundException('Assigner not found');
    }

    const assignerRoles = assigner.userRoles.map(ur => ur.role.name);

    // Check hierarchy
    if (roleName === 'manager') {
      // Only admin can assign manager role
      if (!assignerRoles.includes('admin')) {
        throw new ForbiddenException('Only admin can assign manager role');
      }
    } else if (roleName === 'hr-manager') {
      // Only admin and manager can assign hr-manager role
      if (!assignerRoles.includes('admin') && !assignerRoles.includes('manager')) {
        throw new ForbiddenException('Only admin and manager can assign hr-manager role');
      }
    } else {
      // All other roles can only be assigned by hr-manager, manager, or admin
      if (!assignerRoles.includes('hr-manager') && !assignerRoles.includes('manager') && !assignerRoles.includes('admin')) {
        throw new ForbiddenException('Only hr-manager, manager, or admin can assign this role');
      }
    }
  }

  // Helper method to check ban permission
  private async checkBanPermission(bannerId: string, targetUserRoles: string[]) {
    // Get banner's roles
    const banner = await this.prisma.user.findUnique({
      where: { id: bannerId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!banner) {
      throw new NotFoundException('Banner not found');
    }

    const bannerRoles = banner.userRoles.map(ur => ur.role.name);

    // Check if target has manager role
    if (targetUserRoles.includes('manager')) {
      // Only admin can ban manager
      if (!bannerRoles.includes('admin')) {
        throw new ForbiddenException('Only admin can ban users with manager role');
      }
    } else if (targetUserRoles.includes('hr-manager')) {
      // Only admin or manager can ban hr-manager
      if (!bannerRoles.includes('admin') && !bannerRoles.includes('manager')) {
        throw new ForbiddenException('Only admin or manager can ban users with hr-manager role');
      }
    } else {
      // All others can be banned by hr-manager, manager, or admin
      if (!bannerRoles.includes('hr-manager') && !bannerRoles.includes('manager') && !bannerRoles.includes('admin')) {
        throw new ForbiddenException('Only hr-manager, manager, or admin can ban users');
      }
    }

    // Cannot ban admin
    if (targetUserRoles.includes('admin')) {
      throw new ForbiddenException('Admin users cannot be banned');
    }
  }
}
