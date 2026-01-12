import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CapabilitiesService } from '../capabilities/capabilities.service';
import { AdminQueryDto, ClientQueryDto, MyClientsQueryDto, AdminSortOption } from './dto/admin-query.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UpdateBankAccountDto } from './dto/bank-account.dto';
import { AdminResponseDto, BankAccountResponseDto } from './dto/admin-response.dto';

@Injectable()
export class AdminsService {
  constructor(
    private prisma: PrismaService,
    private capabilitiesService: CapabilitiesService,
  ) {}

  async findAll(query?: AdminQueryDto) {
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

    return {
      data: admins.map(admin => this.mapToAdminResponse(admin)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<AdminResponseDto> {
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

    const capabilities = await this.capabilitiesService.getUserCapabilities(userId);
    return this.mapToAdminResponse(admin, capabilities);
  }

  async updateProfile(userId: string, updateData: UpdateAdminDto) {
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

    const capabilities = await this.capabilitiesService.getUserCapabilities(userId);
    return this.mapToAdminResponse(updated, capabilities);
  }

  async getMyClients(adminId: string, query?: MyClientsQueryDto) {
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
          kyc: {
            select: {
              status: true,
            },
          },
          partnership: {
            select: {
              status: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllClients(query?: ClientQueryDto) {
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
          kyc: {
            select: {
              status: true,
            },
          },
          partnership: {
            select: {
              status: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClientById(clientId: string) {
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
        kyc: true,
        partnership: true,
        lead: true,
        closedByAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
          },
        },
        referredByPartner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
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
          },
          take: 10,
          orderBy: {
            enrollmentDate: 'desc',
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
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

  async updateBankAccount(adminId: string, bankData: UpdateBankAccountDto): Promise<BankAccountResponseDto> {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const updated = await this.prisma.admin.update({
      where: { id: adminId },
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

    return this.maskBankAccount(updated);
  }

  async getBankAccount(adminId: string): Promise<BankAccountResponseDto> {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        accountNumber: true,
        bankCode: true,
        accountName: true,
        bankName: true,
      },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.accountNumber) {
      throw new NotFoundException('Bank account not configured');
    }

    return this.maskBankAccount(admin);
  }

  async deleteBankAccount(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        accountNumber: null,
        bankCode: null,
        accountName: null,
        bankName: null,
      },
    });

    return { message: 'Bank account deleted successfully' };
  }

  private mapToAdminResponse(admin: any, capabilities: string[] = []): AdminResponseDto {
    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
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
      canOnboardClients: admin.canOnboardClients,
      isBanned: admin.user.isBanned,
      isSuspended: admin.user.isSuspended,
      roles: admin.user.userRoles?.map((ur: any) => ur.role.name) || [],
      capabilities,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  private maskBankAccount(bankData: any): BankAccountResponseDto {
    if (!bankData.accountNumber) {
      return null;
    }

    const masked = '****' + bankData.accountNumber.slice(-4);
    return {
      accountNumber: masked,
      bankCode: bankData.bankCode,
      accountName: bankData.accountName,
      bankName: bankData.bankName,
    };
  }
}
