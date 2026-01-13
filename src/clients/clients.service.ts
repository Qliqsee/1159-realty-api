import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CapabilitiesService } from '../capabilities/capabilities.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateBankAccountDto } from './dto/bank-account.dto';
import {
  ClientResponseDto,
  ClientProfileResponseDto,
  ClientDetailResponseDto,
  ReferralsResponseDto,
  BankAccountResponseDto,
} from './dto/client-response.dto';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto,
  LeadSummaryDto,
  EnrollmentSummaryDto,
} from '../common/dto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private capabilitiesService: CapabilitiesService,
  ) {}

  async findByUserId(userId: string): Promise<ClientProfileResponseDto> {
    const client = await this.prisma.client.findUnique({
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

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const capabilities = await this.capabilitiesService.getUserCapabilities(userId);
    return this.mapToClientProfileResponse(client, capabilities);
  }

  async findOne(id: string): Promise<ClientDetailResponseDto> {
    const client = await this.prisma.client.findUnique({
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
        kyc: true,
        partnership: true,
        lead: true,
        closedByAgent: {
          include: {
            user: true,
          },
        },
        referredByPartner: {
          include: {
            user: true,
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

    return this.mapToClientDetail(client);
  }

  async updateProfile(userId: string, updateData: UpdateClientDto): Promise<ClientProfileResponseDto> {
    const client = await this.prisma.client.findUnique({ where: { userId } });

    if (!client) {
      throw new NotFoundException('Client profile not found');
    }

    const updated = await this.prisma.client.update({
      where: { userId },
      data: updateData,
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
    return this.mapToClientProfileResponse(updated, capabilities);
  }

  async getMyAgent(clientId: string): Promise<AdminSummaryDto | { message: string }> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        closedByAgent: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.closedByAgent) {
      return { message: 'No agent assigned to this client' };
    }

    return this.mapToAdminSummary(client.closedByAgent);
  }

  async getMyPartner(clientId: string): Promise<ClientSummaryDto | { message: string }> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        referredByPartner: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.referredByPartner) {
      return { message: 'This client was not referred by a partner' };
    }

    return this.mapToClientSummary(client.referredByPartner);
  }

  async getMyReferrals(clientId: string): Promise<ReferralsResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        partnership: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.partnership || client.partnership.status !== 'APPROVED') {
      return {
        totalReferrals: 0,
        referrals: [],
      };
    }

    const referrals = await this.prisma.client.findMany({
      where: {
        referredByPartnerId: clientId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      totalReferrals: referrals.length,
      referrals: referrals.map(referral => this.mapToClientSummary(referral)),
    };
  }

  async updateBankAccount(clientId: string, bankData: UpdateBankAccountDto): Promise<BankAccountResponseDto> {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const updated = await this.prisma.client.update({
      where: { id: clientId },
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

  async getBankAccount(clientId: string): Promise<BankAccountResponseDto> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: {
        accountNumber: true,
        bankCode: true,
        accountName: true,
        bankName: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    if (!client.accountNumber) {
      throw new NotFoundException('Bank account not configured');
    }

    return this.maskBankAccount(client);
  }

  async deleteBankAccount(clientId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    await this.prisma.client.update({
      where: { id: clientId },
      data: {
        accountNumber: null,
        bankCode: null,
        accountName: null,
        bankName: null,
      },
    });

    return { message: 'Bank account deleted successfully' };
  }

  private mapToClientResponse(client: any): ClientResponseDto {
    return {
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
      leadId: client.leadId,
      closedBy: client.closedBy,
      isSuspended: client.user.isSuspended,
      isBanned: client.user.isBanned,
      roles: client.user.userRoles?.map((ur: any) => ur.role.name) || [],
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }

  private mapToClientProfileResponse(client: any, capabilities: string[]): ClientProfileResponseDto {
    const base = this.mapToClientResponse(client);
    return {
      ...base,
      capabilities,
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

  private mapToClientDetail(client: any): ClientDetailResponseDto {
    const enrollments: EnrollmentSummaryDto[] = client.enrollmentsAsClient?.map((enrollment: any) => ({
      id: enrollment.id,
      propertyId: enrollment.propertyId,
      propertyName: enrollment.property?.name || '',
      status: enrollment.status,
      totalAmount: enrollment.totalAmount.toString(),
      amountPaid: enrollment.amountPaid.toString(),
      enrollmentDate: enrollment.enrollmentDate,
    })) || [];

    return {
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
      leadId: client.leadId,
      closedBy: client.closedBy,
      isSuspended: client.user.isSuspended,
      isBanned: client.user.isBanned,
      roles: client.user.userRoles?.map((ur: any) => ur.role.name) || [],
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      kyc: client.kyc ? {
        id: client.kyc.id,
        status: client.kyc.status,
        currentStep: client.kyc.currentStep,
        submittedAt: client.kyc.submittedAt,
        reviewedAt: client.kyc.reviewedAt,
      } : null,
      partnership: client.partnership ? {
        id: client.partnership.id,
        status: client.partnership.status,
        appliedAt: client.partnership.appliedAt,
        reviewedAt: client.partnership.reviewedAt,
        suspendedAt: client.partnership.suspendedAt,
      } : null,
      lead: client.lead ? {
        id: client.lead.id,
        email: client.lead.email,
        firstName: client.lead.firstName,
        lastName: client.lead.lastName,
        phone: client.lead.phone,
        status: client.lead.status,
      } : null,
      closedByAgent: client.closedByAgent ? {
        id: client.closedByAgent.id,
        userId: client.closedByAgent.userId,
        firstName: client.closedByAgent.firstName,
        lastName: client.closedByAgent.lastName,
        otherName: client.closedByAgent.otherName,
        email: client.closedByAgent.user?.email || '',
        phone: client.closedByAgent.phone,
        createdAt: client.closedByAgent.createdAt,
      } : null,
      referredByPartner: client.referredByPartner ? {
        id: client.referredByPartner.id,
        userId: client.referredByPartner.userId,
        firstName: client.referredByPartner.firstName,
        lastName: client.referredByPartner.lastName,
        otherName: client.referredByPartner.otherName,
        email: client.referredByPartner.user?.email || '',
        phone: client.referredByPartner.phone,
        gender: client.referredByPartner.gender,
        partnerLink: client.referredByPartner.partnerLink,
        hasCompletedOnboarding: client.referredByPartner.hasCompletedOnboarding,
        createdAt: client.referredByPartner.createdAt,
      } : null,
      enrollments,
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
