import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { CreateDisbursementDto } from './dto/create-disbursement.dto';
import { BulkCreateDisbursementDto } from './dto/bulk-create-disbursement.dto';
import { QueryDisbursementsDto } from './dto/query-disbursements.dto';
import { ReleaseDisbursementDto, DisbursementReleaseResponseDto } from './dto/release-disbursement.dto';
import { DisbursementResponseDto, DisbursementStatsDto } from './dto/disbursement-response.dto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class DisbursementsService {
  private readonly paystackSecretKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  async create(createDto: CreateDisbursementDto, createdBy: string) {
    const { commissionId } = createDto;

    // Fetch commission with related data
    const commission = await this.prisma.commission.findUnique({
      where: { id: commissionId },
      include: {
        agent: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } }, accountNumber: true } },
        partner: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } }, accountNumber: true } },
        enrollment: {
          include: {
            property: { select: { name: true } },
            client: { select: { firstName: true, lastName: true, otherName: true } },
          },
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    // Check if commission already has disbursement
    if (commission.disbursementId) {
      throw new BadRequestException('Commission already has a disbursement');
    }

    // Check if commission is PENDING
    if (commission.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING commissions can be disbursed');
    }

    // Determine recipient
    const recipient = commission.type === 'AGENT' ? commission.agent : commission.partner;
    if (!recipient) {
      throw new BadRequestException('Commission recipient not found');
    }

    // Check if recipient has bank details
    if (!recipient.accountNumber) {
      throw new BadRequestException(
        `${commission.type === 'AGENT' ? 'Agent' : 'Partner'} does not have bank details configured`,
      );
    }

    // Create disbursement
    const disbursement = await this.prisma.disbursement.create({
      data: {
        type: 'COMMISSION',
        enrollmentId: commission.enrollmentId,
        recipientId: recipient.id,
        recipientType: commission.type,
        amount: commission.amount,
        status: 'PENDING',
        createdBy,
      },
      include: {
        recipient: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
        enrollment: {
          include: {
            property: { select: { name: true } },
            client: { select: { firstName: true, lastName: true, otherName: true } },
          },
        },
      },
    });

    // Update commission with disbursementId
    await this.prisma.commission.update({
      where: { id: commissionId },
      data: { disbursementId: disbursement.id },
    });

    return this.formatDisbursementResponse(disbursement, commission);
  }

  async bulkCreate(bulkDto: BulkCreateDisbursementDto, createdBy: string) {
    const { commissionIds } = bulkDto;
    const results = [];
    const errors = [];

    for (const commissionId of commissionIds) {
      try {
        const result = await this.create({ commissionId }, createdBy);
        results.push(result);
      } catch (error) {
        errors.push({ commissionId, error: error.message });
      }
    }

    return {
      success: results,
      failed: errors,
      summary: {
        total: commissionIds.length,
        successful: results.length,
        failed: errors.length,
      },
    };
  }

  async findAll(queryDto: QueryDisbursementsDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      type,
      status,
      recipientId,
      recipientType,
      enrollmentId,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.DisbursementWhereInput = {
      ...(type && { type: type as any }),
      ...(status && { status: status as any }),
      ...(recipientId && { recipientId }),
      ...(recipientType && { recipientType }),
      ...(enrollmentId && { enrollmentId }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { recipient: { firstName: { contains: search, mode: 'insensitive' } } },
          { recipient: { lastName: { contains: search, mode: 'insensitive' } } },
          { recipient: { otherName: { contains: search, mode: 'insensitive' } } },
          { enrollment: { property: { name: { contains: search, mode: 'insensitive' } } } },
          { enrollmentId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    // Apply role-based filtering
    if (userRole === 'agent') {
      where.recipientId = userId;
      where.recipientType = 'AGENT';
    } else if (userRole === 'partner') {
      where.recipientId = userId;
      where.recipientType = 'PARTNER';
    }

    const [disbursements, total] = await Promise.all([
      this.prisma.disbursement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          recipient: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
          enrollment: {
            include: {
              property: { select: { name: true } },
              client: { select: { firstName: true, lastName: true, otherName: true } },
            },
          },
          commission: {
            select: {
              id: true,
              type: true,
              percentage: true,
              amount: true,
            },
          },
        },
      }),
      this.prisma.disbursement.count({ where }),
    ]);

    const formattedDisbursements = disbursements.map((d) =>
      this.formatDisbursementResponse(d, d.commission),
    );

    return {
      data: formattedDisbursements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const disbursement = await this.prisma.disbursement.findUnique({
      where: { id },
      include: {
        recipient: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
        enrollment: {
          include: {
            property: { select: { name: true } },
            client: { select: { firstName: true, lastName: true, otherName: true } },
          },
        },
        commission: {
          select: {
            id: true,
            type: true,
            percentage: true,
            amount: true,
          },
        },
      },
    });

    if (!disbursement) {
      throw new NotFoundException('Disbursement not found');
    }

    // Check access rights
    if (userRole === 'agent' && (disbursement.recipientId !== userId || disbursement.recipientType !== 'AGENT')) {
      throw new ForbiddenException('You do not have access to this disbursement');
    }

    if (userRole === 'partner' && (disbursement.recipientId !== userId || disbursement.recipientType !== 'PARTNER')) {
      throw new ForbiddenException('You do not have access to this disbursement');
    }

    return this.formatDisbursementResponse(disbursement, disbursement.commission);
  }

  async release(id: string, releaseDto: ReleaseDisbursementDto, releasedBy: string): Promise<DisbursementReleaseResponseDto> {
    const { accountNumber, bankCode, accountName } = releaseDto;

    const disbursement = await this.prisma.disbursement.findUnique({
      where: { id },
      include: {
        recipient: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
        enrollment: { include: { property: { select: { name: true } } } },
        commission: { select: { id: true } },
      },
    });

    if (!disbursement) {
      throw new NotFoundException('Disbursement not found');
    }

    if (disbursement.status !== 'PENDING') {
      throw new BadRequestException('Only PENDING disbursements can be released');
    }

    // Calculate amount in kobo (Paystack expects kobo)
    const amountInKobo = Math.round(Number(disbursement.amount) * 100);

    try {
      // Create transfer recipient on Paystack
      const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'nuban',
          name: accountName,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        }),
      });

      const recipientData = await recipientResponse.json();

      if (!recipientData.status) {
        throw new BadRequestException(
          `Failed to create transfer recipient: ${recipientData.message}`,
        );
      }

      const recipientCode = recipientData.data.recipient_code;

      // Initiate transfer
      const transferReference = `DISB-${id.substring(0, 8)}-${Date.now()}`;
      const transferResponse = await fetch('https://api.paystack.co/transfer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'balance',
          amount: amountInKobo,
          recipient: recipientCode,
          reason: `${disbursement.type} disbursement for ${disbursement.enrollment.property.name}`,
          reference: transferReference,
        }),
      });

      const transferData = await transferResponse.json();

      if (!transferData.status) {
        // Update disbursement as FAILED
        await this.prisma.disbursement.update({
          where: { id },
          data: {
            status: 'FAILED',
            paystackResponse: transferData,
            releasedBy,
          },
        });

        throw new BadRequestException(
          `Failed to initiate transfer: ${transferData.message}`,
        );
      }

      // Update disbursement status to RELEASED
      const now = new Date();
      await this.prisma.disbursement.update({
        where: { id },
        data: {
          status: 'RELEASED',
          releaseDate: now,
          transferCode: transferData.data.transfer_code,
          transferReference,
          paystackResponse: transferData,
          releasedBy,
        },
      });

      // If this is a commission disbursement, mark commission as PAID
      if (disbursement.commissionId) {
        await this.prisma.commission.update({
          where: { id: disbursement.commissionId },
          data: {
            status: 'PAID',
            paidAt: now,
          },
        });
      }

      return {
        disbursementId: id,
        amount: Number(disbursement.amount),
        transferCode: transferData.data.transfer_code,
        reference: transferReference,
        status: transferData.data.status,
        message: `Disbursement of ₦${Number(disbursement.amount).toLocaleString()} successfully released to ${accountName}`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Transfer failed: ${error.message}`);
    }
  }

  async getStats(userId?: string, userRole?: string, dateFrom?: string, dateTo?: string): Promise<DisbursementStatsDto> {
    const where: Prisma.DisbursementWhereInput = {
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    };

    // Apply role-based filtering
    if (userRole === 'agent') {
      where.recipientId = userId;
      where.recipientType = 'AGENT';
    } else if (userRole === 'partner') {
      where.recipientId = userId;
      where.recipientType = 'PARTNER';
    }

    const [
      totalDisbursements,
      pendingDisbursements,
      releasedDisbursements,
      failedDisbursements,
      totalAmountResult,
      pendingAmountResult,
      releasedAmountResult,
      failedAmountResult,
    ] = await Promise.all([
      this.prisma.disbursement.count({ where }),
      this.prisma.disbursement.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.disbursement.count({ where: { ...where, status: 'RELEASED' } }),
      this.prisma.disbursement.count({ where: { ...where, status: 'FAILED' } }),
      this.prisma.disbursement.aggregate({ where, _sum: { amount: true } }),
      this.prisma.disbursement.aggregate({ where: { ...where, status: 'PENDING' }, _sum: { amount: true } }),
      this.prisma.disbursement.aggregate({ where: { ...where, status: 'RELEASED' }, _sum: { amount: true } }),
      this.prisma.disbursement.aggregate({ where: { ...where, status: 'FAILED' }, _sum: { amount: true } }),
    ]);

    return {
      totalDisbursements,
      pendingDisbursements,
      releasedDisbursements,
      failedDisbursements,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
      pendingAmount: Number(pendingAmountResult._sum.amount || 0),
      releasedAmount: Number(releasedAmountResult._sum.amount || 0),
      failedAmount: Number(failedAmountResult._sum.amount || 0),
    };
  }

  private formatDisbursementResponse(disbursement: any, commission: any): DisbursementResponseDto {
    return {
      id: disbursement.id,
      type: disbursement.type,
      commissionId: disbursement.commissionId || undefined,
      enrollmentId: disbursement.enrollmentId,
      recipientId: disbursement.recipientId,
      recipientType: disbursement.recipientType,
      amount: Number(disbursement.amount),
      status: disbursement.status,
      releaseDate: disbursement.releaseDate || undefined,
      transferCode: disbursement.transferCode || undefined,
      transferReference: disbursement.transferReference || undefined,
      paystackResponse: disbursement.paystackResponse || undefined,
      recipientDetails: {
        id: disbursement.recipient.id,
        name: formatFullName(disbursement.recipient.firstName, disbursement.recipient.lastName, disbursement.recipient.otherName),
        email: disbursement.recipient.user?.email,
      },
      commissionDetails: commission
        ? {
            id: commission.id,
            type: commission.type,
            percentage: Number(commission.percentage),
            amount: Number(commission.amount),
          }
        : undefined,
      enrollmentDetails: {
        id: disbursement.enrollment.id,
        propertyName: disbursement.enrollment.property.name,
        clientName: formatFullName(disbursement.enrollment.client?.firstName, disbursement.enrollment.client?.lastName, disbursement.enrollment.client?.otherName),
        totalAmount: Number(disbursement.enrollment.totalAmount),
      },
      createdAt: disbursement.createdAt,
      updatedAt: disbursement.updatedAt,
      createdBy: disbursement.createdBy,
      releasedBy: disbursement.releasedBy || undefined,
    };
  }
}
