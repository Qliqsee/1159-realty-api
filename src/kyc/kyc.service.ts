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

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(private prisma: PrismaService) {}

  async savePersonalStep(
    userId: string,
    data: SavePersonalStepDto,
  ): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    // Save step data
    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        personal: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.PERSONAL),
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
    return updated;
  }

  async saveAddressStep(
    userId: string,
    data: SaveAddressStepDto,
  ): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        address: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.ADDRESS),
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
    return updated;
  }

  async saveOccupationStep(
    userId: string,
    data: SaveOccupationStepDto,
  ): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        occupation: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.OCCUPATION),
        updatedBy: userId,
      },
    });

    this.logger.log(`Occupation step saved for KYC ${kyc.id}`);
    return updated;
  }

  async saveIdentityStep(
    userId: string,
    data: SaveIdentityStepDto,
  ): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        identity: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.IDENTITY),
        updatedBy: userId,
      },
    });

    this.logger.log(`Identity step saved for KYC ${kyc.id}`);
    return updated;
  }

  async saveNextOfKinStep(
    userId: string,
    data: SaveNextOfKinStepDto,
  ): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        nextOfKin: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.NEXT_OF_KIN),
        updatedBy: userId,
      },
    });

    this.logger.log(`Next of kin step saved for KYC ${kyc.id}`);
    return updated;
  }

  async saveBankStep(userId: string, data: SaveBankStepDto): Promise<Kyc> {
    const kyc = await this.getOrCreateKyc(userId, userId);

    const updated = await this.prisma.kyc.update({
      where: { id: kyc.id },
      data: {
        bank: data as any,
        currentStep: this.advanceStep(kyc.currentStep, KycStep.BANK),
        updatedBy: userId,
      },
    });

    this.logger.log(`Bank step saved for KYC ${kyc.id}`);
    return updated;
  }

  async submitKyc(userId: string): Promise<Kyc> {
    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    // Validate all steps are completed
    if (!kyc.personal || !kyc.address || !kyc.occupation || !kyc.identity || !kyc.nextOfKin || !kyc.bank) {
      throw new BadRequestException('All KYC steps must be completed before submission');
    }

    // Update KYC status to SUBMITTED and create history snapshot
    const updated = await this.prisma.$transaction(async (tx) => {
      // Update KYC
      const updatedKyc = await tx.kyc.update({
        where: { id: kyc.id },
        data: {
          status: KycStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      // Create history snapshot
      await tx.kycHistory.create({
        data: {
          kycId: kyc.id,
          status: KycStatus.SUBMITTED,
          personal: kyc.personal,
          address: kyc.address,
          occupation: kyc.occupation,
          identity: kyc.identity,
          nextOfKin: kyc.nextOfKin,
          bank: kyc.bank,
          submittedAt: new Date(),
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kyc.id} submitted for review`);
    return updated;
  }

  async getMyKyc(userId: string): Promise<Kyc | null> {
    return this.prisma.kyc.findUnique({
      where: { userId },
      include: {
        rejectionReasons: true,
      },
    });
  }

  async getKycById(id: string): Promise<Kyc> {
    const kyc = await this.prisma.kyc.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        rejectionReasons: true,
      },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    return kyc;
  }

  async listKycs(
    status?: KycStatus,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Kyc[]; total: number; page: number; limit: number }> {
    const where: Prisma.KycWhereInput = status ? { status } : {};

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

    return { data, total, page, limit };
  }

  async approveKyc(kycId: string, adminId: string): Promise<Kyc> {
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
        },
      });

      return updatedKyc;
    });

    this.logger.log(`KYC ${kycId} approved by admin ${adminId}`);
    return updated;
  }

  async rejectKyc(kycId: string, adminId: string, reason: string): Promise<Kyc> {
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

  private async getOrCreateKyc(userId: string, createdBy?: string): Promise<Kyc> {
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
