import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientIncludeQueryDto } from './dto/client-query.dto';
import {
  ClientResponseDto,
  ReferralsResponseDto,
} from './dto/client-response.dto';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto,
} from '../common/dto';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async findByUserId(userId: string, query?: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    // Always include capabilities for authenticated user requesting own profile
    const includeKyc = query?.includeKyc === true;
    const includePartnership = query?.includePartnership === true;
    const includeAgent = query?.includeAgent === true;
    const includePartner = query?.includePartner === true;

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
      throw new NotFoundException('Client profile not found');
    }

    // Capabilities will be derived by FE from roles + permissions map
    const capabilities = [];

    return this.mapToClientResponse(client, {
      capabilities,
      includeKyc,
      includePartnership,
      includeAgent,
      includePartner,
    });
  }

  async findOne(id: string, query?: ClientIncludeQueryDto): Promise<ClientResponseDto> {
    const includeCapabilities = query?.includeCapabilities === true;
    const includeKyc = query?.includeKyc === true;
    const includePartnership = query?.includePartnership === true;
    const includeAgent = query?.includeAgent === true;
    const includePartner = query?.includePartner === true;

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

    // Fetch capabilities only if explicitly requested (will be empty for non-owner)
    const capabilities = includeCapabilities ? [] : undefined;

    return this.mapToClientResponse(client, {
      capabilities,
      includeKyc,
      includePartnership,
      includeAgent,
      includePartner,
    });
  }

  async updateProfile(userId: string, updateData: UpdateClientDto): Promise<ClientResponseDto> {
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

    const capabilities = [];
    return this.mapToClientResponse(updated, { capabilities });
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

  mapToClientSummary(client: any): ClientSummaryDto {
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

  mapToAdminSummary(admin: any): AdminSummaryDto {
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
}
