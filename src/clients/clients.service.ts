import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CapabilitiesService } from '../capabilities/capabilities.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { UpdateBankAccountDto } from './dto/bank-account.dto';
import { ClientResponseDto, BankAccountResponseDto } from './dto/client-response.dto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class ClientsService {
  constructor(
    private prisma: PrismaService,
    private capabilitiesService: CapabilitiesService,
  ) {}

  async findByUserId(userId: string): Promise<ClientResponseDto> {
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
    return this.mapToClientResponse(client, capabilities);
  }

  async findOne(id: string): Promise<any> {
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
        referredByPartner: {
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

  async updateProfile(userId: string, updateData: UpdateClientDto) {
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
    return this.mapToClientResponse(updated, capabilities);
  }

  async getMyAgent(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        closedByAgent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
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

    return client.closedByAgent;
  }

  async getMyPartner(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        referredByPartner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            phone: true,
            partnerLink: true,
            user: {
              select: {
                email: true,
              },
            },
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

    return client.referredByPartner;
  }

  async getMyReferrals(clientId: string) {
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
        message: 'Client is not an approved partner',
        referrals: [],
      };
    }

    const referrals = await this.prisma.client.findMany({
      where: {
        referredByPartnerId: clientId,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        kyc: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      totalReferrals: referrals.length,
      referrals,
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

  private mapToClientResponse(client: any, capabilities: string[] = []): ClientResponseDto {
    return {
      id: client.id,
      userId: client.userId,
      email: client.user.email,
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
      capabilities,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
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
