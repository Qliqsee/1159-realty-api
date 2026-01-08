import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { CommissionResponseDto, CommissionStatsDto } from './dto/commission-response.dto';
import { ReleaseCommissionDto, CommissionReleaseResponseDto } from './dto/commission-release.dto';
import { Prisma, CommissionStatus as PrismaCommissionStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CommissionsService {
  private readonly paystackSecretKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
  }

  async findAll(queryDto: QueryCommissionsDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      status,
      type,
      enrollmentId,
      dateFrom,
      dateTo,
      search,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.CommissionWhereInput = {
      ...(status && { status: status as any }),
      ...(type && { type: type as any }),
      ...(enrollmentId && { enrollmentId }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { enrollmentId: { contains: search, mode: 'insensitive' } },
          { enrollment: { client: { name: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { property: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    };

    // Apply role-based filtering
    if (userRole === 'agent') {
      where.agentId = userId;
    } else if (userRole === 'partner') {
      where.partnerId = userId;
    }

    const [commissions, total] = await Promise.all([
      this.prisma.commission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          agent: { select: { name: true } },
          partner: { select: { name: true } },
          enrollment: {
            include: {
              property: { select: { name: true } },
              client: { select: { name: true } },
            },
          },
          invoice: {
            select: {
              id: true,
              installmentNumber: true,
              amount: true,
              paidAt: true,
            },
          },
        },
      }),
      this.prisma.commission.count({ where }),
    ]);

    const formattedCommissions: CommissionResponseDto[] = commissions.map(commission => ({
      id: commission.id,
      enrollmentId: commission.enrollmentId,
      invoiceId: commission.invoiceId,
      agentId: commission.agentId || undefined,
      agentName: commission.agent?.name,
      partnerId: commission.partnerId || undefined,
      partnerName: commission.partner?.name,
      type: commission.type as any,
      percentage: Number(commission.percentage),
      amount: Number(commission.amount),
      status: commission.status as any,
      dueDate: commission.dueDate || undefined,
      paidAt: commission.paidAt || undefined,
      enrollmentDetails: {
        id: commission.enrollment.id,
        propertyName: commission.enrollment.property.name,
        clientName: commission.enrollment.client?.name,
        totalAmount: Number(commission.enrollment.totalAmount),
      },
      invoiceDetails: {
        id: commission.invoice.id,
        installmentNumber: commission.invoice.installmentNumber,
        amount: Number(commission.invoice.amount),
        paidAt: commission.invoice.paidAt || undefined,
      },
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
    }));

    return {
      data: formattedCommissions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        partner: { select: { id: true, name: true, email: true } },
        enrollment: {
          include: {
            property: { select: { id: true, name: true } },
            agent: { select: { name: true } },
            client: { select: { id: true, name: true, email: true } },
          },
        },
        invoice: {
          select: {
            id: true,
            installmentNumber: true,
            amount: true,
            dueDate: true,
            paidAt: true,
            paymentReference: true,
          },
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    // Check access rights
    if (userRole === 'agent' && commission.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this commission');
    }

    if (userRole === 'partner' && commission.partnerId !== userId) {
      throw new ForbiddenException('You do not have access to this commission');
    }

    const response: CommissionResponseDto = {
      id: commission.id,
      enrollmentId: commission.enrollmentId,
      invoiceId: commission.invoiceId,
      agentId: commission.agentId || undefined,
      agentName: commission.agent?.name,
      partnerId: commission.partnerId || undefined,
      partnerName: commission.partner?.name,
      type: commission.type as any,
      percentage: Number(commission.percentage),
      amount: Number(commission.amount),
      status: commission.status as any,
      dueDate: commission.dueDate || undefined,
      paidAt: commission.paidAt || undefined,
      enrollmentDetails: {
        id: commission.enrollment.id,
        propertyName: commission.enrollment.property.name,
        clientName: commission.enrollment.client?.name,
        totalAmount: Number(commission.enrollment.totalAmount),
      },
      invoiceDetails: {
        id: commission.invoice.id,
        installmentNumber: commission.invoice.installmentNumber,
        amount: Number(commission.invoice.amount),
        paidAt: commission.invoice.paidAt || undefined,
      },
      createdAt: commission.createdAt,
      updatedAt: commission.updatedAt,
    };

    return response;
  }

  async markAsPaid(id: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id },
      include: {
        agent: { select: { name: true } },
        partner: { select: { name: true } },
        enrollment: {
          include: {
            property: { select: { name: true } },
            client: { select: { name: true } },
          },
        },
        invoice: {
          select: {
            id: true,
            installmentNumber: true,
            amount: true,
            paidAt: true,
          },
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status === PrismaCommissionStatus.PAID) {
      throw new BadRequestException('Commission is already paid');
    }

    const now = new Date();

    const updatedCommission = await this.prisma.commission.update({
      where: { id },
      data: {
        status: PrismaCommissionStatus.PAID,
        paidAt: now,
      },
    });

    return {
      id: updatedCommission.id,
      enrollmentId: commission.enrollmentId,
      invoiceId: commission.invoiceId,
      agentId: commission.agentId || undefined,
      agentName: commission.agent?.name,
      partnerId: commission.partnerId || undefined,
      partnerName: commission.partner?.name,
      type: commission.type as any,
      percentage: Number(commission.percentage),
      amount: Number(commission.amount),
      status: updatedCommission.status as any,
      dueDate: commission.dueDate || undefined,
      paidAt: updatedCommission.paidAt || undefined,
      enrollmentDetails: {
        id: commission.enrollment.id,
        propertyName: commission.enrollment.property.name,
        clientName: commission.enrollment.client?.name,
        totalAmount: Number(commission.enrollment.totalAmount),
      },
      invoiceDetails: {
        id: commission.invoice.id,
        installmentNumber: commission.invoice.installmentNumber,
        amount: Number(commission.invoice.amount),
        paidAt: commission.invoice.paidAt || undefined,
      },
      createdAt: commission.createdAt,
      updatedAt: updatedCommission.updatedAt,
    };
  }

  async getStats(userId?: string, userRole?: string, dateFrom?: string, dateTo?: string) {
    const where: Prisma.CommissionWhereInput = {
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    };

    // Apply role-based filtering
    if (userRole === 'agent') {
      where.agentId = userId;
    } else if (userRole === 'partner') {
      where.partnerId = userId;
    }

    const [
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalAmountResult,
      pendingAmountResult,
      paidAmountResult,
    ] = await Promise.all([
      this.prisma.commission.count({ where }),
      this.prisma.commission.count({
        where: { ...where, status: PrismaCommissionStatus.PENDING },
      }),
      this.prisma.commission.count({
        where: { ...where, status: PrismaCommissionStatus.PAID },
      }),
      this.prisma.commission.aggregate({
        where,
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { ...where, status: PrismaCommissionStatus.PENDING },
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { ...where, status: PrismaCommissionStatus.PAID },
        _sum: { amount: true },
      }),
    ]);

    const stats: CommissionStatsDto = {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
      pendingAmount: Number(pendingAmountResult._sum.amount || 0),
      paidAmount: Number(paidAmountResult._sum.amount || 0),
    };

    return stats;
  }

  async releaseCommission(
    id: string,
    releaseDto: ReleaseCommissionDto,
  ): Promise<CommissionReleaseResponseDto> {
    const { accountNumber, bankCode, accountName } = releaseDto;

    // Fetch commission with related data
    const commission = await this.prisma.commission.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        partner: { select: { id: true, name: true, email: true } },
        enrollment: {
          include: {
            property: { select: { name: true } },
          },
        },
        invoice: {
          select: { installmentNumber: true },
        },
      },
    });

    if (!commission) {
      throw new NotFoundException('Commission not found');
    }

    if (commission.status === PrismaCommissionStatus.PAID) {
      throw new BadRequestException('Commission is already paid');
    }

    // Calculate amount in kobo (Paystack expects kobo)
    const amountInKobo = Math.round(Number(commission.amount) * 100);

    // Create transfer recipient on Paystack
    const recipientResponse = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
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
    const transferReference = `COMM-${id.substring(0, 8)}-${Date.now()}`;
    const transferResponse = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amountInKobo,
        recipient: recipientCode,
        reason: `Commission payment for ${commission.enrollment.property.name} - Installment #${commission.invoice.installmentNumber}`,
        reference: transferReference,
      }),
    });

    const transferData = await transferResponse.json();

    if (!transferData.status) {
      throw new BadRequestException(
        `Failed to initiate transfer: ${transferData.message}`,
      );
    }

    // Update commission status to PAID
    const now = new Date();
    await this.prisma.commission.update({
      where: { id },
      data: {
        status: PrismaCommissionStatus.PAID,
        paidAt: now,
      },
    });

    return {
      commissionId: id,
      amount: Number(commission.amount),
      transferCode: transferData.data.transfer_code,
      reference: transferReference,
      status: transferData.data.status,
      message: `Commission of ₦${Number(commission.amount).toLocaleString()} successfully released to ${accountName}`,
    };
  }
}
