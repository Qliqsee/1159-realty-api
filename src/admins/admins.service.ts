import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminQueryDto, ClientQueryDto, MyClientsQueryDto, AdminSortOption } from './dto/admin-query.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminIncludeQueryDto } from './dto/admin-include-query.dto';
import { ClientIncludeQueryDto } from '../clients/dto/client-query.dto';
import {
  AdminResponseDto,
  AdminListResponseDto,
} from './dto/admin-response.dto';
import {
  ClientListResponseDto,
  ClientResponseDto,
} from '../clients/dto/client-response.dto';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto,
  LeadSummaryDto,
  EnrollmentSummaryDto,
} from '../common/dto';

@Injectable()
export class AdminsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findAll(query?: AdminQueryDto & AdminIncludeQueryDto): Promise<AdminListResponseDto> {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { otherName: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.roleId) {
      where.user = {
        ...where.user,
        userRoles: {
          some: {
            roleId: query.roleId,
          },
        },
      };
    }

    if (query?.isSuspended !== undefined) {
      where.user = {
        ...where.user,
        isSuspended: query.isSuspended === 'true',
      };
    }

    if (query?.isBanned !== undefined) {
      where.user = {
        ...where.user,
        isBanned: query.isBanned === 'true',
      };
    }

    if (query?.canOnboardClients !== undefined) {
      where.canOnboardClients = query.canOnboardClients === 'true';
    }

    if (query?.country) {
      where.country = query.country;
    }

    if (query?.state) {
      where.state = query.state;
    }

    switch (query?.sort) {
      case AdminSortOption.OLDEST:
        orderBy.createdAt = 'asc';
        break;
      case AdminSortOption.LATEST:
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const [admins, total] = await Promise.all([
      this.prisma.admin.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.admin.count({ where }),
    ]);

    let adminData: AdminResponseDto[];

    if (query?.includeCapabilities) {
      adminData = await Promise.all(
        admins.map(async admin => {
          const capabilities = [];
          return this.mapToAdminResponse(admin, capabilities);
        })
      );
    } else {
      adminData = admins.map(admin => this.mapToAdminResponse(admin));
    }

    return {
      data: adminData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, query?: AdminIncludeQueryDto): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (query?.includeCapabilities) {
      const capabilities = [];
      return this.mapToAdminResponse(admin, capabilities);
    }

    return this.mapToAdminResponse(admin);
  }

  async findByUserId(userId: string): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    const capabilities = [];
    return this.mapToAdminResponse(admin, capabilities);
  }

  async updateProfile(userId: string, updateData: UpdateAdminDto): Promise<AdminResponseDto> {
    const admin = await this.prisma.admin.findUnique({ where: { userId } });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }

    const updated = await this.prisma.admin.update({
      where: { userId },
      data: {
        ...updateData,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : undefined,
      },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    const capabilities = [];
    return this.mapToAdminResponse(updated, capabilities);
  }

  async getMyClients(adminId: string, query?: MyClientsQueryDto): Promise<ClientListResponseDto> {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        {
          enrollmentsAsClient: {
            some: {
              adminId,
            },
          },
        },
        {
          closedBy: adminId,
        },
      ],
    };

    if (query?.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { user: { email: { contains: query.search, mode: 'insensitive' } } },
            { phone: { contains: query.search, mode: 'insensitive' } },
          ],
        },
      ];
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

    if (query?.excludePartners === 'true') {
      where.partnership = null;
    }

    const orderBy: any = {};
    switch (query?.sort) {
      case AdminSortOption.OLDEST:
        orderBy.createdAt = 'asc';
        break;
      case AdminSortOption.LATEST:
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients.map(client => this.mapToClientSummary(client)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllClients(query?: ClientQueryDto): Promise<ClientListResponseDto> {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    const orderBy: any = {};

    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { otherName: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
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

    if (query?.hasCompletedOnboarding !== undefined) {
      where.hasCompletedOnboarding = query.hasCompletedOnboarding === 'true';
    }

    if (query?.excludePartners === 'true') {
      where.partnership = null;
    }

    switch (query?.sort) {
      case AdminSortOption.OLDEST:
        orderBy.createdAt = 'asc';
        break;
      case AdminSortOption.LATEST:
      default:
        orderBy.createdAt = 'desc';
        break;
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
        },
        orderBy,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients.map(client => this.mapToClientSummary(client)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClientById(clientId: string, query?: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    const includeKyc = query?.includeKyc === true;
    const includePartnership = query?.includePartnership === true;
    const includeAgent = query?.includeAgent === true;
    const includePartner = query?.includePartner === true;

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        user: {
          include: {
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
        kyc: includeKyc,
        partnership: includePartnership,
        closedByAgent: includeAgent ? {
          include: {
            user: true,
          },
        } : false,
        referredByPartner: includePartner ? {
          include: {
            user: true,
          },
        } : false,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // When admin views client, capabilities should always be empty array
    const capabilities: string[] = [];

    return this.mapToClientResponse(client, {
      capabilities,
      includeKyc,
      includePartnership,
      includeAgent,
      includePartner,
    });
  }

  async banAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.user.update({
      where: { id: admin.userId },
      data: { isBanned: true },
    });

    return { message: 'Admin banned successfully' };
  }

  async unbanAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.user.update({
      where: { id: admin.userId },
      data: { isBanned: false },
    });

    return { message: 'Admin unbanned successfully' };
  }

  async suspendAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { canOnboardClients: false },
    });

    return { message: 'Admin suspended from onboarding clients' };
  }

  async unsuspendAdmin(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { canOnboardClients: true },
    });

    return { message: 'Admin onboarding capability restored' };
  }

  async changeRole(adminId: string, roleId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.userRole.deleteMany({
      where: { userId: admin.userId },
    });

    await this.prisma.userRole.create({
      data: {
        userId: admin.userId,
        roleId,
      },
    });

    return { message: 'Admin role changed successfully' };
  }

  private mapToAdminResponse(admin: any, capabilities?: string[]): AdminResponseDto {
    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
      isEmailVerified: admin.user.isEmailVerified,
      firstName: admin.firstName,
      lastName: admin.lastName,
      otherName: admin.otherName,
      phone: admin.phone,
      dateOfBirth: admin.dateOfBirth,
      street: admin.street,
      city: admin.city,
      state: admin.state,
      country: admin.country,
      postalCode: admin.postalCode,
      accountNumber: admin.accountNumber,
      bankCode: admin.bankCode,
      accountName: admin.accountName,
      bankName: admin.bankName,
      canOnboardClients: admin.canOnboardClients,
      isBanned: admin.user.isBanned,
      isSuspended: admin.user.isSuspended,
      roles: admin.user.userRoles?.map((ur: any) => ur.role.name) || [],
      ...(capabilities !== undefined && { capabilities }),
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  private mapToAdminSummary(admin: any): AdminSummaryDto {
    return {
      id: admin.id,
      userId: admin.userId,
      firstName: admin.firstName,
      lastName: admin.lastName,
      otherName: admin.otherName,
      email: admin.user?.email || '',
      phone: admin.phone,
      createdAt: admin.createdAt,
    };
  }

  private mapToClientSummary(client: any): ClientSummaryDto {
    return {
      id: client.id,
      userId: client.userId,
      firstName: client.firstName,
      lastName: client.lastName,
      otherName: client.otherName,
      email: client.user.email,
      phone: client.phone,
      gender: client.gender,
      partnerLink: client.partnerLink,
      hasCompletedOnboarding: client.hasCompletedOnboarding,
      createdAt: client.createdAt,
    };
  }

  private mapToClientResponse(
    client: any,
    options?: {
      capabilities?: string[];
      includeKyc?: boolean;
      includePartnership?: boolean;
      includeAgent?: boolean;
      includePartner?: boolean;
    },
  ): ClientResponseDto {
    const response: ClientResponseDto = {
      id: client.id,
      userId: client.userId,
      email: client.user.email,
      isEmailVerified: client.user.isEmailVerified,
      firstName: client.firstName,
      lastName: client.lastName,
      otherName: client.otherName,
      phone: client.phone,
      gender: client.gender,
      referralSource: client.referralSource,
      country: client.country,
      state: client.state,
      hasCompletedOnboarding: client.hasCompletedOnboarding,
      partnerLink: client.partnerLink,
      referredByPartnerId: client.referredByPartnerId,
      closedBy: client.closedBy,
      isSuspended: client.user.isSuspended,
      isBanned: client.user.isBanned,
      roles: client.user.userRoles?.map((ur: any) => ur.role.name) || [],
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };

    // Add optional fields if requested
    if (options?.capabilities !== undefined) {
      response.capabilities = options.capabilities;
    }

    if (options?.includeKyc && client.kyc) {
      response.kyc = {
        id: client.kyc.id,
        status: client.kyc.status,
        currentStep: client.kyc.currentStep,
        submittedAt: client.kyc.submittedAt,
        reviewedAt: client.kyc.reviewedAt,
      };
    }

    if (options?.includePartnership && client.partnership) {
      response.partnership = {
        id: client.partnership.id,
        status: client.partnership.status,
        appliedAt: client.partnership.appliedAt,
        reviewedAt: client.partnership.reviewedAt,
        suspendedAt: client.partnership.suspendedAt,
      };
    }

    if (options?.includeAgent && client.closedByAgent) {
      response.closedByAgent = this.mapToAdminSummary(client.closedByAgent);
    }

    if (options?.includePartner && client.referredByPartner) {
      response.referredByPartner = this.mapToClientSummary(client.referredByPartner);
    }

    return response;
  }

}
