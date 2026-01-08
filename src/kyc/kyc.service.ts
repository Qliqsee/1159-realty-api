import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Kyc, KycStatus, KycStep, Prisma } from '@prisma/client';
import { SavePersonalStepDto } from './dto/save-personal-step.dto';
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

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(private prisma: PrismaService) {}

  async savePersonalStep(
    userId: string,
    data: SavePersonalStepDto,
    continueToNext: boolean = false,
  ): Promise<SavePersonalStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    // Save to draft field
    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        personalDraft: data as any,
        personal: data as any, // Also update main field for immediate use
        currentStep: continueToNext
          ? this.getNextStep(KycStep.PERSONAL)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    // Update User fields after personal step
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hasCompletedOnboarding: true,
        gender: data.gender,
        referralSource: data.referralSource,
      },
    });

    this.logger.log(`Personal step saved for KYC ${kyc.id}`);

    return {
      message: 'Personal information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
      hasCompletedOnboarding: true,
    };
  }

  async saveAddressStep(
    userId: string,
    data: SaveAddressStepDto,
    continueToNext: boolean = false,
  ): Promise<SaveAddressStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        addressDraft: data as any,
        address: data as any,
        currentStep: continueToNext
          ? this.getNextStep(KycStep.ADDRESS)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    // Update User fields after address step
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        country: data.country,
        state: data.state,
      },
    });

    this.logger.log(`Address step saved for KYC ${kyc.id}`);

    return {
      message: 'Address information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
    };
  }

  async saveOccupationStep(
    userId: string,
    data: SaveOccupationStepDto,
    continueToNext: boolean = false,
  ): Promise<SaveOccupationStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        occupationDraft: data as any,
        occupation: data as any,
        currentStep: continueToNext
          ? this.getNextStep(KycStep.OCCUPATION)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    this.logger.log(`Occupation step saved for KYC ${kyc.id}`);

    return {
      message: 'Occupation information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
    };
  }

  async saveIdentityStep(
    userId: string,
    data: SaveIdentityStepDto,
    continueToNext: boolean = false,
  ): Promise<SaveIdentityStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        identityDraft: data as any,
        identity: data as any,
        currentStep: continueToNext
          ? this.getNextStep(KycStep.IDENTITY)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    this.logger.log(`Identity step saved for KYC ${kyc.id}`);

    return {
      message: 'Identity information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
    };
  }

  async saveNextOfKinStep(
    userId: string,
    data: SaveNextOfKinStepDto,
    continueToNext: boolean = false,
  ): Promise<SaveNextOfKinStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        nextOfKinDraft: data as any,
        nextOfKin: data as any,
        currentStep: continueToNext
          ? this.getNextStep(KycStep.NEXT_OF_KIN)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    this.logger.log(`Next of kin step saved for KYC ${kyc.id}`);

    return {
      message: 'Next of kin information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
    };
  }

  async saveBankStep(
    userId: string,
    data: SaveBankStepDto,
    continueToNext: boolean = false,
  ): Promise<SaveBankStepResponseDto> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        bankDraft: data as any,
        bank: data as any,
        currentStep: continueToNext
          ? this.getNextStep(KycStep.BANK)
          : kyc.currentStep,
        updatedBy: userId,
      },
    });

    this.logger.log(`Bank step saved for KYC ${kyc.id}`);

    return {
      message: 'Bank information saved successfully',
      status: updated.status,
      currentStep: updated.currentStep,
    };
  }

  async submitKyc(userId: string): Promise<Kyc> {
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Validate all steps are completed using draft or main fields
    const personalData = kyc.personalDraft || kyc.personal;
    const addressData = kyc.addressDraft || kyc.address;
    const occupationData = kyc.occupationDraft || kyc.occupation;
    const identityData = kyc.identityDraft || kyc.identity;
    const nextOfKinData = kyc.nextOfKinDraft || kyc.nextOfKin;
    const bankData = kyc.bankDraft || kyc.bank;

    if (
      !personalData ||
      !addressData ||
      !occupationData ||
      !identityData ||
      !nextOfKinData ||
      !bankData
    ) {
      throw new BadRequestException(
        'All KYC steps must be completed before submission',
      );
    }

    // Update KYC status to SUBMITTED and create history snapshot
    const updated = await this.prisma.$transaction(async (tx) => {
      // Copy draft data to main fields and update status
      const updatedKyc = await tx.kyc.update({
        where: { id: kyc.id },
        data: {
          status: KycStatus.SUBMITTED,
          personal: personalData,
          address: addressData,
          occupation: occupationData,
          identity: identityData,
          nextOfKin: nextOfKinData,
          bank: bankData,
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
          submittedAt: new Date(),
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kyc.id} submitted for review`);
    return updated;
  }

  async getMyKyc(userId: string) {
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
      include: {
        rejectionReasons: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!kyc) {
      return null;
    }

    // Get draft changes if applicable
    const draftChanges = this.getDraftChanges(kyc);

    // Format rejection reasons with truncated version
    const rejectionReasons = kyc.rejectionReasons.map((r) => ({
      id: r.id,
      reason: r.reason,
      truncatedReason:
        r.reason.length > 100 ? r.reason.substring(0, 100) + '...' : r.reason,
      createdAt: r.createdAt,
    }));

    return {
      ...kyc,
      draftChanges,
      rejectionReasons,
    };
  }

  async getKycById(id: string) {
    const kyc = await this.prisma.kyc.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        reviewer: {
          select: { id: true, email: true, name: true },
        },
        rejectionReasons: {
          orderBy: { createdAt: 'desc' },
        },
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            reviewer: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Format rejection reasons with truncated version
    const rejectionReasons = kyc.rejectionReasons.map((r) => ({
      id: r.id,
      reason: r.reason,
      truncatedReason:
        r.reason.length > 100 ? r.reason.substring(0, 100) + '...' : r.reason,
      createdAt: r.createdAt,
    }));

    return {
      ...kyc,
      rejectionReasons,
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
    limit: number = 20,
  ) {
    const where: Prisma.KycWhereInput = {};

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
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
          user: {
            select: { id: true, email: true, name: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      this.prisma.kyc.count({ where }),
    ]);

    const hasMore = page * limit < total;

    return { data, total, page, limit, hasMore };
  }

  async approveKyc(kycId: string, adminId: string, feedback?: string): Promise<Kyc> {
    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    if (kyc.status !== KycStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted KYCs can be approved');
    }

    // Update KYC status and history
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedKyc = await tx.kyc.update({
        where: { id: kycId },
        data: {
          status: KycStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          feedback: feedback || null,
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
          reviewAction: 'APPROVED',
          feedback: feedback || null,
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kycId} approved by admin ${adminId}`);
    return updated;
  }

  async rejectKyc(
    kycId: string,
    adminId: string,
    reason: string,
    feedback?: string,
  ): Promise<Kyc> {
    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    if (kyc.status !== KycStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted KYCs can be rejected');
    }

    // Update KYC status, add rejection reason, and update history
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedKyc = await tx.kyc.update({
        where: { id: kycId },
        data: {
          status: KycStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedBy: adminId,
          feedback: feedback || null,
        },
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
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kycId} rejected by admin ${adminId}`);
    return updated;
  }

  async getKycHistory(kycId: string) {
    const kyc = await this.prisma.kyc.findUnique({ where: { id: kycId } });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    return this.prisma.kycHistory.findMany({
      where: { kycId },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async validateKyc(userId: string): Promise<{
    isValid: boolean;
    errors: ValidationErrorDto[];
  }> {
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
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

  private async getOrCreateKyc(
    userId: string,
    createdBy?: string,
  ): Promise<Kyc> {
    let kyc = await this.prisma.kyc.findUnique({ where: { userId } });

    if (!kyc) {
      kyc = await this.prisma.kyc.create({
        data: {
          userId,
          status: KycStatus.DRAFT,
          currentStep: KycStep.PERSONAL,
          createdBy,
        },
      });
      this.logger.log(`New KYC created for user ${userId}`);
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
}
