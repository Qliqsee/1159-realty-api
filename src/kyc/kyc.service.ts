import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { ClientsService } from '../clients/clients.service';
import { Kyc, KycStatus, KycStep, Prisma } from '@prisma/client';
import { formatFullName } from '../common/utils/name.utils';
import { extractAgentReferralId } from '../common/utils/referral-id.util';
import { SavePersonalStepDto } from './dto/save-personal-step.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { SaveAddressStepDto } from './dto/save-address-step.dto';
import { SaveOccupationStepDto } from './dto/save-occupation-step.dto';
import { SaveIdentityStepDto } from './dto/save-identity-step.dto';
import { SaveNextOfKinStepDto } from './dto/save-next-of-kin-step.dto';
import { SaveBankStepDto } from './dto/save-bank-step.dto';
import { DraftChangeDto } from './dto/draft-change.dto';
import { ValidationErrorDto } from './dto/validate-kyc.dto';
import {
  SavePersonalStepResponseDto,
  SaveAddressStepResponseDto,
  SaveOccupationStepResponseDto,
  SaveIdentityStepResponseDto,
  SaveNextOfKinStepResponseDto,
  SaveBankStepResponseDto,
} from './dto/save-step-response.dto';
import { ClientResponseDto } from '../clients/dto/client-response.dto';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
    @Inject(forwardRef(() => ClientsService))
    private clientsService: ClientsService,
  ) {}

  async savePersonalStep(
    userId: string,
    data: SavePersonalStepDto,
  ): Promise<ClientResponseDto> {
    // Check if onboarding already completed
    const existingClient = await this.prisma.client.findUnique({
      where: { userId },
      select: { hasCompletedOnboarding: true },
    });

    if (existingClient?.hasCompletedOnboarding) {
      throw new BadRequestException('Onboarding has been completed already. Use /kyc/personal endpoint to update personal information.');
    }

    const kyc = await this.getOrCreateKyc(userId);

    // Validate referralId and determine link type
    const { referredByAgentId, referredByPartnerId } = await this.validateAndLinkReferral(data.referralId);

    // Extract only personal info (exclude referralSource and referralId)
    const personalInfo = {
      firstName: data.firstName,
      lastName: data.lastName,
      dob: data.dob,
      gender: data.gender,
      maritalStatus: data.maritalStatus,
    };

    // Save to draft field and set personalStatus to DRAFT
    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        personalDraft: personalInfo as any,
        personal: personalInfo as any, // Also update main field for immediate use
        personalStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    // Update Client fields after personal step (onboarding)
    await this.prisma.client.update({
      where: { userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        hasCompletedOnboarding: true,
        gender: data.gender,
        referralSource: data.referralSource,
        referredByAgentId,
        referredByPartnerId,
      },
    });

    this.logger.log(`Personal step saved for KYC ${kyc.id} (onboarding)`);

    // Fetch updated client information with full response
    return this.clientsService.findByUserId(userId);
  }

  async updatePersonalInfo(
    userId: string,
    data: UpdatePersonalInfoDto,
  ): Promise<SavePersonalStepResponseDto> {
    // Check if onboarding completed
    const existingClient = await this.prisma.client.findUnique({
      where: { userId },
      select: { hasCompletedOnboarding: true },
    });

    if (!existingClient?.hasCompletedOnboarding) {
      throw new BadRequestException('Please complete onboarding first using /kyc/personal/onboarding endpoint.');
    }

    const kyc = await this.getOrCreateKyc(userId);

    // Save to draft field only (not Client table) and set personalStatus to DRAFT
    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        personalDraft: data as any,
        personalStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Personal info updated in draft for KYC ${kyc.id}`);

    // Return updated personal information
    return this.getMyPersonalInfo(userId);
  }

  async saveAddressStep(
    userId: string,
    data: SaveAddressStepDto,
  ): Promise<SaveAddressStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        addressDraft: data as any,
        addressStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Address step saved in draft for KYC ${kyc.id}`);

    // Return updated address information
    return this.getMyAddressInfo(userId);
  }

  async saveOccupationStep(
    userId: string,
    data: SaveOccupationStepDto,
  ): Promise<SaveOccupationStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        occupationDraft: data as any,
        occupationStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Occupation step saved in draft for KYC ${kyc.id}`);

    // Return updated occupation information
    return this.getMyOccupationInfo(userId);
  }

  async saveIdentityStep(
    userId: string,
    data: SaveIdentityStepDto,
  ): Promise<SaveIdentityStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        identityDraft: data as any,
        identityStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Identity step saved in draft for KYC ${kyc.id}`);

    // Return updated identity information
    return this.getMyIdentityInfo(userId);
  }

  async saveNextOfKinStep(
    userId: string,
    data: SaveNextOfKinStepDto,
  ): Promise<SaveNextOfKinStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        nextOfKinDraft: data as any,
        nextOfKinStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Next of kin step saved in draft for KYC ${kyc.id}`);

    // Return updated next of kin information
    return this.getMyNextOfKinInfo(userId);
  }

  async saveBankStep(
    userId: string,
    data: SaveBankStepDto,
  ): Promise<SaveBankStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        bankDraft: data as any,
        bankStatus: KycStatus.DRAFT,
      },
    });

    // Calculate overall status
    const overallStatus = this.calculateOverallStatus(
      updated.personalStatus,
      updated.addressStatus,
      updated.occupationStatus,
      updated.identityStatus,
      updated.nextOfKinStatus,
      updated.bankStatus,
    );

    // Update overall status
    await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: { status: overallStatus },
    });

    this.logger.log(`Bank step saved in draft for KYC ${kyc.id}`);

    // Return updated bank information
    return this.getMyBankInfo(userId);
  }

  async submitKyc(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Check all sections have data (validation already done at section save)
    const personalData = kyc.personalDraft || kyc.personal;
    const addressData = kyc.addressDraft || kyc.address;
    const occupationData = kyc.occupationDraft || kyc.occupation;
    const identityData = kyc.identityDraft || kyc.identity;
    const nextOfKinData = kyc.nextOfKinDraft || kyc.nextOfKin;
    const bankData = kyc.bankDraft || kyc.bank;

    if (!personalData || !addressData || !occupationData || !identityData || !nextOfKinData || !bankData) {
      throw new BadRequestException('All KYC sections must be completed before submission');
    }

    // Update KYC status to SUBMITTED and create history snapshot
    const updated = await this.prisma.$transaction(async (tx) => {
      // Submit ALL sections - change all section statuses to SUBMITTED
      const updatedKyc = await tx.kyc.update({
        where: { id: kyc.id },
        data: {
          personalStatus: KycStatus.SUBMITTED,
          addressStatus: KycStatus.SUBMITTED,
          occupationStatus: KycStatus.SUBMITTED,
          identityStatus: KycStatus.SUBMITTED,
          nextOfKinStatus: KycStatus.SUBMITTED,
          bankStatus: KycStatus.SUBMITTED,
          status: KycStatus.SUBMITTED,
          submittedAt: new Date(),
          lastSubmittedAt: new Date(),
        },
      });

      // Create history snapshot
      await tx.kycHistory.create({
        data: {
          kycId: kyc.id,
          status: KycStatus.SUBMITTED,
          personal: personalData,
          address: addressData,
          occupation: occupationData,
          identity: identityData,
          nextOfKin: nextOfKinData,
          bank: bankData,
          personalStatus: KycStatus.SUBMITTED,
          addressStatus: KycStatus.SUBMITTED,
          occupationStatus: KycStatus.SUBMITTED,
          identityStatus: KycStatus.SUBMITTED,
          nextOfKinStatus: KycStatus.SUBMITTED,
          bankStatus: KycStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kyc.id} submitted for review`);

    // Send notification email to admin
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const clientWithEmail = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        firstName: true,
        lastName: true,
        otherName: true,
        user: { select: { email: true } },
      },
    });

    if (adminEmail && clientWithEmail) {
      await this.emailService.sendKycSubmittedEmail(
        adminEmail,
        formatFullName(clientWithEmail.firstName, clientWithEmail.lastName, clientWithEmail.otherName) || 'User',
        clientWithEmail.user.email,
        kyc.id,
      );
    }

    // Return the same response as GET /kyc/me
    return this.getMyKyc(userId);
  }

  async getMyKyc(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
    });

    if (!kyc) {
      return null;
    }

    // Get draft changes if applicable
    const draftChanges = this.getDraftChanges(kyc);

    return {
      ...kyc,
      draftChanges,
    };
  }

  async getMyPersonalInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        personalDraft: true,
        personal: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const personalData = kyc?.personalDraft || kyc?.personal;

    // If no personal data saved in KYC, return null
    if (!personalData) {
      return null;
    }

    const data = personalData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      dob: data.dob || null,
      gender: data.gender || null,
      maritalStatus: data.maritalStatus || null,
    };
  }

  async getMyOccupationInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        occupationDraft: true,
        occupation: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const occupationData = kyc?.occupationDraft || kyc?.occupation;

    // If no occupation data saved in KYC, return null
    if (!occupationData) {
      return null;
    }

    const data = occupationData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      employmentStatus: data.employmentStatus || null,
      employerName: data.employerName || null,
      jobTitle: data.jobTitle || null,
      businessName: data.businessName || null,
      businessType: data.businessType || null,
      officeAddress: data.officeAddress || null,
    };
  }

  async getMyNextOfKinInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        nextOfKinDraft: true,
        nextOfKin: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const nextOfKinData = kyc?.nextOfKinDraft || kyc?.nextOfKin;

    // If no next of kin data saved in KYC, return null
    if (!nextOfKinData) {
      return null;
    }

    const data = nextOfKinData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      fullName: data.fullName || null,
      phoneNumber: data.phoneNumber || null,
      relationship: data.relationship || null,
      address: data.address || null,
    };
  }

  async getMyAddressInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        addressDraft: true,
        address: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const addressData = kyc?.addressDraft || kyc?.address;

    // If no address data saved in KYC, return null
    if (!addressData) {
      return null;
    }

    const data = addressData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      country: data.country || null,
      stateId: data.stateId || null,
      lga: data.lga || null,
      address: data.address || null,
      nationality: data.nationality || null,
    };
  }

  async getMyIdentityInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        identityDraft: true,
        identity: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const identityData = kyc?.identityDraft || kyc?.identity;

    // If no identity data saved in KYC, return null
    if (!identityData) {
      return null;
    }

    const data = identityData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      idImageUrl: data.idImageUrl || null,
      profilePictureUrl: data.profilePictureUrl || null,
      phoneNumber: data.phoneNumber || null,
    };
  }

  async getMyBankInfo(userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!client) {
      return null;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
      select: {
        bankDraft: true,
        bank: true,
      },
    });

    // Use draft if available, otherwise use approved data
    const bankData = kyc?.bankDraft || kyc?.bank;

    // If no bank data saved in KYC, return null
    if (!bankData) {
      return null;
    }

    const data = bankData as any;

    return {
      clientId: client.id,
      userId: client.userId,
      bankName: data.bankName || null,
      accountNumber: data.accountNumber || null,
      accountName: data.accountName || null,
    };
  }

  async getKycById(id: string) {
    const kyc = await this.prisma.kyc.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: { select: { id: true, email: true } },
          },
        },
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Format client and reviewer data to include name field
    const formattedClient = {
      id: kyc.client.id,
      name: formatFullName(
        kyc.client.firstName,
        kyc.client.lastName,
        kyc.client.otherName,
      ),
      user: kyc.client.user,
    };

    const formattedReviewer = kyc.reviewer
      ? {
          id: kyc.reviewer.id,
          name: formatFullName(
            kyc.reviewer.firstName,
            kyc.reviewer.lastName,
            kyc.reviewer.otherName,
          ),
          user: kyc.reviewer.user,
        }
      : null;

    // Explicitly exclude rejectionReasons and history
    const { client: _client, reviewer: _reviewer, ...kycData } = kyc;

    return {
      ...kycData,
      client: formattedClient,
      reviewer: formattedReviewer,
    };
  }

  async listKycs(
    search?: string,
    status?: KycStatus,
    submissionDateFrom?: string,
    submissionDateTo?: string,
    reviewDateFrom?: string,
    reviewDateTo?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const where: Prisma.KycWhereInput = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { client: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { client: { firstName: { contains: search, mode: 'insensitive' } } },
        { client: { lastName: { contains: search, mode: 'insensitive' } } },
        { client: { otherName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (submissionDateFrom || submissionDateTo) {
      where.submittedAt = {};
      if (submissionDateFrom) {
        where.submittedAt.gte = new Date(submissionDateFrom);
      }
      if (submissionDateTo) {
        where.submittedAt.lte = new Date(submissionDateTo);
      }
    }

    if (reviewDateFrom || reviewDateTo) {
      where.reviewedAt = {};
      if (reviewDateFrom) {
        where.reviewedAt.gte = new Date(reviewDateFrom);
      }
      if (reviewDateTo) {
        where.reviewedAt.lte = new Date(reviewDateTo);
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.kyc.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              user: { select: { id: true, email: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.kyc.count({ where }),
    ]);

    // Format client data to include name field and personal info
    const formattedData = data.map((kyc) => ({
      ...kyc,
      client: {
        id: kyc.client.id,
        name: formatFullName(
          kyc.client.firstName,
          kyc.client.lastName,
          kyc.client.otherName,
        ),
        user: kyc.client.user,
      },
      personal: kyc.personal as any, // Include personal info from onboarding
    }));

    const hasMore = page * limit < total;

    return { data: formattedData, total, page, limit, hasMore };
  }

  async approveKyc(kycId: string, userId: string, feedback?: string): Promise<Kyc> {
    // Get admin ID from user ID
    const admin = await this.prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }
    const adminId = admin.id;

    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Check if any sections are submitted
    const hasSubmittedSections = [
      kyc.personalStatus,
      kyc.addressStatus,
      kyc.occupationStatus,
      kyc.identityStatus,
      kyc.nextOfKinStatus,
      kyc.bankStatus,
    ].some(status => status === KycStatus.SUBMITTED);

    if (!hasSubmittedSections) {
      throw new BadRequestException('No submitted sections to approve');
    }

    // Update KYC status and history
    const updated = await this.prisma.$transaction(async (tx) => {
      // Build update data - move draft to main for SUBMITTED sections and set status to APPROVED
      const updateData: any = {
        reviewedAt: new Date(),
        reviewedBy: adminId,
        feedback: feedback || null,
      };

      // Move draft to main fields and update status to APPROVED for SUBMITTED sections
      if (kyc.personalStatus === KycStatus.SUBMITTED) {
        updateData.personalStatus = KycStatus.APPROVED;
        updateData.personal = kyc.personalDraft || kyc.personal;
      }
      if (kyc.addressStatus === KycStatus.SUBMITTED) {
        updateData.addressStatus = KycStatus.APPROVED;
        updateData.address = kyc.addressDraft || kyc.address;
      }
      if (kyc.occupationStatus === KycStatus.SUBMITTED) {
        updateData.occupationStatus = KycStatus.APPROVED;
        updateData.occupation = kyc.occupationDraft || kyc.occupation;
      }
      if (kyc.identityStatus === KycStatus.SUBMITTED) {
        updateData.identityStatus = KycStatus.APPROVED;
        updateData.identity = kyc.identityDraft || kyc.identity;
      }
      if (kyc.nextOfKinStatus === KycStatus.SUBMITTED) {
        updateData.nextOfKinStatus = KycStatus.APPROVED;
        updateData.nextOfKin = kyc.nextOfKinDraft || kyc.nextOfKin;
      }
      if (kyc.bankStatus === KycStatus.SUBMITTED) {
        updateData.bankStatus = KycStatus.APPROVED;
        updateData.bank = kyc.bankDraft || kyc.bank;
      }

      // Clear all draft fields after moving to main
      updateData.personalDraft = null;
      updateData.addressDraft = null;
      updateData.occupationDraft = null;
      updateData.identityDraft = null;
      updateData.nextOfKinDraft = null;
      updateData.bankDraft = null;

      const updatedKyc = await tx.kyc.update({
        where: { id: kycId },
        data: updateData,
      });

      // Calculate overall status based on section statuses
      const overallStatus = this.calculateOverallStatus(
        updatedKyc.personalStatus,
        updatedKyc.addressStatus,
        updatedKyc.occupationStatus,
        updatedKyc.identityStatus,
        updatedKyc.nextOfKinStatus,
        updatedKyc.bankStatus,
      );

      // Update overall status
      await tx.kyc.update({
        where: { id: kycId },
        data: { status: overallStatus },
      });

      // Update latest history record
      await tx.kycHistory.updateMany({
        where: {
          kycId,
          reviewedAt: null,
        },
        data: {
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewAction: 'APPROVED',
          feedback: feedback || null,
          personalStatus: updatedKyc.personalStatus,
          addressStatus: updatedKyc.addressStatus,
          occupationStatus: updatedKyc.occupationStatus,
          identityStatus: updatedKyc.identityStatus,
          nextOfKinStatus: updatedKyc.nextOfKinStatus,
          bankStatus: updatedKyc.bankStatus,
        },
      });

      // Sync approved data from KYC JSON to Client table
      try {
        const personal = updatedKyc.personal as any;
        const address = updatedKyc.address as any;

        const clientUpdateData: any = {};

        if (personal) {
          if (personal.firstName) clientUpdateData.firstName = personal.firstName;
          if (personal.lastName) clientUpdateData.lastName = personal.lastName;
          if (personal.gender) clientUpdateData.gender = personal.gender;
        }

        if (address) {
          if (address.country) clientUpdateData.country = address.country;
          if (address.stateId) clientUpdateData.stateId = address.stateId;
        }

        if (Object.keys(clientUpdateData).length > 0) {
          await tx.client.update({
            where: { id: kyc.clientId },
            data: clientUpdateData,
          });

          this.logger.log(`Synced approved KYC data to Client table for client ${kyc.clientId}: ${Object.keys(clientUpdateData).join(', ')}`);
        }
      } catch (error) {
        this.logger.error(`Failed to sync KYC data to Client table for client ${kyc.clientId}:`, error);
        // Don't fail the approval if sync fails, just log the error
      }

      return updatedKyc;
    });

    this.logger.log(`KYC ${kycId} approved by admin ${adminId}`);

    // Send approval email to client
    const client = await this.prisma.client.findUnique({
      where: { id: kyc.clientId },
      select: {
        firstName: true,
        lastName: true,
        otherName: true,
        user: { select: { email: true } },
      },
    });

    if (client) {
      await this.emailService.sendKycApprovedEmail(
        client.user.email,
        formatFullName(client.firstName, client.lastName, client.otherName) || 'User',
        feedback,
      );
    }

    return updated;
  }

  async rejectKyc(
    kycId: string,
    userId: string,
    reason: string,
    feedback?: string,
  ): Promise<Kyc> {
    // Get admin ID from user ID
    const admin = await this.prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }
    const adminId = admin.id;

    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Check if any sections are submitted
    const hasSubmittedSections = [
      kyc.personalStatus,
      kyc.addressStatus,
      kyc.occupationStatus,
      kyc.identityStatus,
      kyc.nextOfKinStatus,
      kyc.bankStatus,
    ].some(status => status === KycStatus.SUBMITTED);

    if (!hasSubmittedSections) {
      throw new BadRequestException('No submitted sections to reject');
    }

    // Update KYC status, add rejection reason, and update history
    const updated = await this.prisma.$transaction(async (tx) => {
      // Build update data - only change SUBMITTED sections to REJECTED
      const updateData: any = {
        reviewedAt: new Date(),
        reviewedBy: adminId,
        feedback: feedback || null,
      };

      // Only update sections with SUBMITTED status to REJECTED
      if (kyc.personalStatus === KycStatus.SUBMITTED) {
        updateData.personalStatus = KycStatus.REJECTED;
      }
      if (kyc.addressStatus === KycStatus.SUBMITTED) {
        updateData.addressStatus = KycStatus.REJECTED;
      }
      if (kyc.occupationStatus === KycStatus.SUBMITTED) {
        updateData.occupationStatus = KycStatus.REJECTED;
      }
      if (kyc.identityStatus === KycStatus.SUBMITTED) {
        updateData.identityStatus = KycStatus.REJECTED;
      }
      if (kyc.nextOfKinStatus === KycStatus.SUBMITTED) {
        updateData.nextOfKinStatus = KycStatus.REJECTED;
      }
      if (kyc.bankStatus === KycStatus.SUBMITTED) {
        updateData.bankStatus = KycStatus.REJECTED;
      }

      const updatedKyc = await tx.kyc.update({
        where: { id: kycId },
        data: updateData,
      });

      // Calculate overall status based on section statuses
      const overallStatus = this.calculateOverallStatus(
        updatedKyc.personalStatus,
        updatedKyc.addressStatus,
        updatedKyc.occupationStatus,
        updatedKyc.identityStatus,
        updatedKyc.nextOfKinStatus,
        updatedKyc.bankStatus,
      );

      // Update overall status
      await tx.kyc.update({
        where: { id: kycId },
        data: { status: overallStatus },
      });

      // Add rejection reason
      await tx.kycRejectionReason.create({
        data: {
          kycId,
          reason,
          createdBy: adminId,
        },
      });

      // Update latest history record
      await tx.kycHistory.updateMany({
        where: {
          kycId,
          reviewedAt: null,
        },
        data: {
          reviewedAt: new Date(),
          reviewedBy: adminId,
          reviewAction: 'REJECTED',
          rejectionReasons: [reason],
          feedback: feedback || null,
          personalStatus: updatedKyc.personalStatus,
          addressStatus: updatedKyc.addressStatus,
          occupationStatus: updatedKyc.occupationStatus,
          identityStatus: updatedKyc.identityStatus,
          nextOfKinStatus: updatedKyc.nextOfKinStatus,
          bankStatus: updatedKyc.bankStatus,
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kycId} rejected by admin ${adminId}`);

    // Send rejection email to client
    const client = await this.prisma.client.findUnique({
      where: { id: kyc.clientId },
      select: {
        firstName: true,
        lastName: true,
        otherName: true,
        user: { select: { email: true } },
      },
    });

    if (client) {
      await this.emailService.sendKycRejectedEmail(
        client.user.email,
        formatFullName(client.firstName, client.lastName, client.otherName) || 'User',
        reason,
        feedback,
      );
    }

    return updated;
  }

  async getKycHistory(
    kycId: string,
    status?: string,
    submissionDateFrom?: string,
    submissionDateTo?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    const where: any = { kycId };

    if (status) {
      where.status = status;
    }

    if (submissionDateFrom || submissionDateTo) {
      where.createdAt = {};
      if (submissionDateFrom) {
        where.createdAt.gte = new Date(submissionDateFrom);
      }
      if (submissionDateTo) {
        where.createdAt.lte = new Date(submissionDateTo);
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.kycHistory.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      this.prisma.kycHistory.count({ where }),
    ]);

    // Format the response
    const formattedData = data.map((item) => ({
      ...item,
      reviewer: item.reviewer
        ? {
            id: item.reviewer.id,
            firstName: item.reviewer.firstName,
            lastName: item.reviewer.lastName,
            email: item.reviewer.user.email,
          }
        : null,
    }));

    return {
      data: formattedData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async validateKyc(userId: string): Promise<{
    isValid: boolean;
    errors: ValidationErrorDto[];
  }> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      return {
        isValid: false,
        errors: [
          {
            step: KycStep.PERSONAL,
            field: 'client',
            message: 'Client not found.',
          },
        ],
      };
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
    });

    const errors: ValidationErrorDto[] = [];

    if (!kyc) {
      return {
        isValid: false,
        errors: [
          {
            step: KycStep.PERSONAL,
            field: 'kyc',
            message: 'KYC not found. Please start by completing personal information.',
          },
        ],
      };
    }

    // Check each step using draft or main fields
    const personalData = kyc.personalDraft || kyc.personal;
    const addressData = kyc.addressDraft || kyc.address;
    const occupationData = kyc.occupationDraft || kyc.occupation;
    const identityData = kyc.identityDraft || kyc.identity;
    const nextOfKinData = kyc.nextOfKinDraft || kyc.nextOfKin;
    const bankData = kyc.bankDraft || kyc.bank;

    if (!personalData) {
      errors.push({
        step: KycStep.PERSONAL,
        field: 'personal',
        message: 'Personal information is required',
      });
    }

    if (!addressData) {
      errors.push({
        step: KycStep.ADDRESS,
        field: 'address',
        message: 'Address information is required',
      });
    }

    if (!occupationData) {
      errors.push({
        step: KycStep.OCCUPATION,
        field: 'occupation',
        message: 'Occupation information is required',
      });
    }

    if (!identityData) {
      errors.push({
        step: KycStep.IDENTITY,
        field: 'identity',
        message: 'Identity information is required',
      });
    }

    if (!nextOfKinData) {
      errors.push({
        step: KycStep.NEXT_OF_KIN,
        field: 'nextOfKin',
        message: 'Next of kin information is required',
      });
    }

    if (!bankData) {
      errors.push({
        step: KycStep.BANK,
        field: 'bank',
        message: 'Bank information is required',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  isKycComplete(kyc: Kyc | null): boolean {
    if (!kyc) return false;
    return !!(
      kyc.personal &&
      kyc.address &&
      kyc.occupation &&
      kyc.identity &&
      kyc.nextOfKin &&
      kyc.bank
    );
  }

  isKycVerified(kyc: Kyc | null): boolean {
    if (!kyc) return false;
    return kyc.status === KycStatus.APPROVED;
  }

  getDraftChanges(kyc: Kyc): DraftChangeDto[] {
    const changes: DraftChangeDto[] = [];

    // Compare each step's draft vs submitted version
    this.compareStepData(
      'personal',
      kyc.personal,
      kyc.personalDraft,
      changes,
    );
    this.compareStepData('address', kyc.address, kyc.addressDraft, changes);
    this.compareStepData(
      'occupation',
      kyc.occupation,
      kyc.occupationDraft,
      changes,
    );
    this.compareStepData('identity', kyc.identity, kyc.identityDraft, changes);
    this.compareStepData(
      'nextOfKin',
      kyc.nextOfKin,
      kyc.nextOfKinDraft,
      changes,
    );
    this.compareStepData('bank', kyc.bank, kyc.bankDraft, changes);

    return changes;
  }

  private compareStepData(
    section: string,
    submitted: any,
    draft: any,
    changes: DraftChangeDto[],
  ) {
    if (!draft) return; // No draft data means no changes

    const submittedData = submitted || {};
    const draftData = draft;

    // Compare each field
    for (const field of Object.keys(draftData)) {
      const oldValue = submittedData[field];
      const newValue = draftData[field];

      // Only add if values are different (trim strings for comparison)
      const oldValueStr =
        typeof oldValue === 'string' ? oldValue.trim() : oldValue;
      const newValueStr =
        typeof newValue === 'string' ? newValue.trim() : newValue;

      if (JSON.stringify(oldValueStr) !== JSON.stringify(newValueStr)) {
        changes.push({
          section,
          field,
          oldValue: oldValue ?? null,
          newValue,
        });
      }
    }
  }

  private async validateAndLinkReferral(referralId: string): Promise<{
    referredByAgentId: string;
    referredByPartnerId: string | null;
  }> {
    // Check if it's an agent referral ID (format: AGT-XXXXX)
    if (/^AGT-[A-Z0-9]{5}$/.test(referralId)) {
      const agent = await this.prisma.admin.findUnique({
        where: { referralId },
        select: {
          id: true,
          referralId: true,
          canOnboardClients: true,
          user: {
            select: {
              isSuspended: true,
              isBanned: true,
            },
          },
        },
      });

      if (!agent) {
        throw new BadRequestException('Invalid agent referral ID');
      }

      if (agent.user.isSuspended) {
        throw new BadRequestException('This agent is currently suspended and cannot onboard clients');
      }

      if (agent.user.isBanned) {
        throw new BadRequestException('This agent is banned and cannot onboard clients');
      }

      if (!agent.canOnboardClients) {
        throw new BadRequestException('This agent is not authorized to onboard clients');
      }

      return {
        referredByAgentId: agent.id,
        referredByPartnerId: null,
      };
    }

    // Check if it's a partner referral ID (format: AGT-XXXXX-P###)
    if (/^AGT-[A-Z0-9]{5}-P\d{3}$/.test(referralId)) {
      const partner = await this.prisma.client.findUnique({
        where: { referralId },
        select: {
          id: true,
          referredByAgentId: true,
          user: {
            select: {
              isSuspended: true,
              isBanned: true,
            },
          },
          partnership: {
            select: {
              status: true,
            },
          },
        },
      });

      if (!partner) {
        throw new BadRequestException('Invalid partner referral ID');
      }

      if (!partner.partnership || partner.partnership.status !== 'APPROVED') {
        throw new BadRequestException('This partner is not approved');
      }

      if (partner.user.isSuspended) {
        throw new BadRequestException('This partner is currently suspended');
      }

      if (partner.user.isBanned) {
        throw new BadRequestException('This partner is banned and cannot onboard clients');
      }

      if (!partner.referredByAgentId) {
        throw new BadRequestException('Could not determine agent for this partner');
      }

      return {
        referredByAgentId: partner.referredByAgentId,
        referredByPartnerId: partner.id,
      };
    }

    // Invalid format
    throw new BadRequestException('Invalid referral ID format. Must be an agent ID (AGT-XXXXX) or partner ID (AGT-XXXXX-P###)');
  }

  private async getOrCreateKyc(
    userId: string,
    createdBy?: string,
  ): Promise<Kyc> {
    const client = await this.prisma.client.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    let kyc = await this.prisma.kyc.findUnique({ where: { clientId: client.id } });

    if (!kyc) {
      const createData: any = {
        clientId: client.id,
        status: KycStatus.DRAFT,
        currentStep: KycStep.PERSONAL,
      };

      // Only set createdBy if it's provided (for admin-created KYCs)
      if (createdBy) {
        createData.createdBy = createdBy;
      }

      kyc = await this.prisma.kyc.create({
        data: createData,
      });
      this.logger.log(`New KYC created for client ${client.id}`);
    }

    return kyc;
  }

  private getNextStep(currentStep: KycStep): KycStep {
    const stepOrder = [
      KycStep.PERSONAL,
      KycStep.ADDRESS,
      KycStep.OCCUPATION,
      KycStep.IDENTITY,
      KycStep.NEXT_OF_KIN,
      KycStep.BANK,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      return stepOrder[currentIndex + 1];
    }
    return currentStep; // Stay on last step
  }

  private advanceStep(currentStep: KycStep, savedStep: KycStep): KycStep {
    const stepOrder = [
      KycStep.PERSONAL,
      KycStep.ADDRESS,
      KycStep.OCCUPATION,
      KycStep.IDENTITY,
      KycStep.NEXT_OF_KIN,
      KycStep.BANK,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    const savedIndex = stepOrder.indexOf(savedStep);

    // If saving the next step or a future step, advance
    if (savedIndex >= currentIndex) {
      return savedIndex === stepOrder.length - 1
        ? KycStep.BANK
        : stepOrder[savedIndex + 1] || KycStep.BANK;
    }

    // Otherwise, keep current step
    return currentStep;
  }

  private calculateOverallStatus(
    personalStatus: KycStatus,
    addressStatus: KycStatus,
    occupationStatus: KycStatus,
    identityStatus: KycStatus,
    nextOfKinStatus: KycStatus,
    bankStatus: KycStatus,
  ): KycStatus {
    const statuses = [
      personalStatus,
      addressStatus,
      occupationStatus,
      identityStatus,
      nextOfKinStatus,
      bankStatus,
    ];

    // Priority order: DRAFT > SUBMITTED > REJECTED > APPROVED
    if (statuses.some(s => s === KycStatus.DRAFT)) {
      return KycStatus.DRAFT;
    }
    if (statuses.some(s => s === KycStatus.SUBMITTED)) {
      return KycStatus.SUBMITTED;
    }
    if (statuses.some(s => s === KycStatus.REJECTED)) {
      return KycStatus.REJECTED;
    }
    // All sections must be APPROVED
    return KycStatus.APPROVED;
  }

  async getKycRejections(
    kycId: string,
    search?: string,
    createdFrom?: string,
    createdTo?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    const where: any = { kycId };

    if (search) {
      where.reason = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.kycRejectionReason.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      this.prisma.kycRejectionReason.count({ where }),
    ]);

    // Format the response
    const formattedData = data.map((item) => ({
      id: item.id,
      kycId: item.kycId,
      reason: item.reason,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
      reviewer: {
        id: item.creator.id,
        firstName: item.creator.firstName,
        lastName: item.creator.lastName,
        email: item.creator.user.email,
      },
    }));

    return {
      data: formattedData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getKycByClientId(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: client.id },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found for this client');
    }

    // Get draft changes if applicable
    const draftChanges = this.getDraftChanges(kyc);

    return {
      ...kyc,
      draftChanges,
    };
  }
}
