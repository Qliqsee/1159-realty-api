import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueryCommissionsDto } from './dto/query-commissions.dto';
import { CommissionResponseDto, CommissionStatsDto } from './dto/commission-response.dto';
import { Prisma, CommissionStatus as PrismaCommissionStatus } from '@prisma/client';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class CommissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryDto: QueryCommissionsDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      status,
      type,
      enrollmentId,
      agentId,
      partnerId,
      propertyId,
      clientId,
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
      ...(agentId && { agentId }),
      ...(partnerId && { partnerId }),
      ...(propertyId && { enrollment: { propertyId } }),
      ...(clientId && { enrollment: { clientId } }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { enrollmentId: { contains: search, mode: 'insensitive' } },
          { enrollment: { client: { firstName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { lastName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { otherName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { property: { name: { contains: search, mode: 'insensitive' } } } },
          { agent: { firstName: { contains: search, mode: 'insensitive' } } },
          { agent: { lastName: { contains: search, mode: 'insensitive' } } },
          { agent: { otherName: { contains: search, mode: 'insensitive' } } },
          { partner: { firstName: { contains: search, mode: 'insensitive' } } },
          { partner: { lastName: { contains: search, mode: 'insensitive' } } },
          { partner: { otherName: { contains: search, mode: 'insensitive' } } },
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
          agent: { select: { firstName: true, lastName: true, otherName: true } },
          partner: { select: { firstName: true, lastName: true, otherName: true } },
          enrollment: {
            include: {
              property: { select: { name: true } },
              client: { select: { firstName: true, lastName: true, otherName: true } },
              agent: { select: { firstName: true, lastName: true, otherName: true } },
              partner: { select: { firstName: true, lastName: true, otherName: true } },
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
          disbursement: {
            select: {
              id: true,
              status: true,
              amount: true,
              releaseDate: true,
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
      agentName: commission.agent ? formatFullName(commission.agent.firstName, commission.agent.lastName, commission.agent.otherName) : undefined,
      partnerId: commission.partnerId || undefined,
      partnerName: commission.partner ? formatFullName(commission.partner.firstName, commission.partner.lastName, commission.partner.otherName) : undefined,
      type: commission.type as any,
      percentage: Number(commission.percentage),
      amount: Number(commission.amount),
      status: commission.status as any,
      dueDate: commission.dueDate || undefined,
      paidAt: commission.paidAt || undefined,
      disbursementId: commission.disbursementId || undefined,
      disbursementStatus: commission.disbursementId ? 'DISBURSED' : 'PENDING',
      disbursementDetails: commission.disbursement
        ? {
            id: commission.disbursement.id,
            status: commission.disbursement.status,
            amount: Number(commission.disbursement.amount),
            releaseDate: commission.disbursement.releaseDate || undefined,
          }
        : undefined,
      enrollmentDetails: {
        id: commission.enrollment.id,
        propertyName: commission.enrollment.property.name,
        clientName: commission.enrollment.client ? formatFullName(commission.enrollment.client.firstName, commission.enrollment.client.lastName, commission.enrollment.client.otherName) : undefined,
        totalAmount: Number(commission.enrollment.totalAmount),
        agentName: commission.enrollment.agent ? formatFullName(commission.enrollment.agent.firstName, commission.enrollment.agent.lastName, commission.enrollment.agent.otherName) : undefined,
        partnerName: commission.enrollment.partner ? formatFullName(commission.enrollment.partner.firstName, commission.enrollment.partner.lastName, commission.enrollment.partner.otherName) : undefined,
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
        agent: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
        partner: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
        enrollment: {
          include: {
            property: { select: { id: true, name: true } },
            agent: { select: { firstName: true, lastName: true, otherName: true } },
            partner: { select: { firstName: true, lastName: true, otherName: true } },
            client: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
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
        disbursement: {
          select: {
            id: true,
            status: true,
            amount: true,
            releaseDate: true,
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
      agentName: commission.agent ? formatFullName(commission.agent.firstName, commission.agent.lastName, commission.agent.otherName) : undefined,
      partnerId: commission.partnerId || undefined,
      partnerName: commission.partner ? formatFullName(commission.partner.firstName, commission.partner.lastName, commission.partner.otherName) : undefined,
      type: commission.type as any,
      percentage: Number(commission.percentage),
      amount: Number(commission.amount),
      status: commission.status as any,
      dueDate: commission.dueDate || undefined,
      paidAt: commission.paidAt || undefined,
      disbursementId: commission.disbursementId || undefined,
      disbursementStatus: commission.disbursementId ? 'DISBURSED' : 'PENDING',
      disbursementDetails: commission.disbursement
        ? {
            id: commission.disbursement.id,
            status: commission.disbursement.status,
            amount: Number(commission.disbursement.amount),
            releaseDate: commission.disbursement.releaseDate || undefined,
          }
        : undefined,
      enrollmentDetails: {
        id: commission.enrollment.id,
        propertyName: commission.enrollment.property.name,
        clientName: commission.enrollment.client ? formatFullName(commission.enrollment.client.firstName, commission.enrollment.client.lastName, commission.enrollment.client.otherName) : undefined,
        totalAmount: Number(commission.enrollment.totalAmount),
        agentName: commission.enrollment.agent ? formatFullName(commission.enrollment.agent.firstName, commission.enrollment.agent.lastName, commission.enrollment.agent.otherName) : undefined,
        partnerName: commission.enrollment.partner ? formatFullName(commission.enrollment.partner.firstName, commission.enrollment.partner.lastName, commission.enrollment.partner.otherName) : undefined,
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

    // Get disbursement metrics
    const [totalDisbursedCount, pendingDisbursementCount] = await Promise.all([
      this.prisma.commission.count({
        where: { ...where, disbursementId: { not: null } },
      }),
      this.prisma.commission.count({
        where: { ...where, disbursementId: null, status: PrismaCommissionStatus.PENDING },
      }),
    ]);

    const stats: CommissionStatsDto = {
      totalCommissions,
      pendingCommissions,
      paidCommissions,
      totalAmount: Number(totalAmountResult._sum.amount || 0),
      pendingAmount: Number(pendingAmountResult._sum.amount || 0),
      paidAmount: Number(paidAmountResult._sum.amount || 0),
      totalDisbursed: totalDisbursedCount,
      pendingDisbursement: pendingDisbursementCount,
    };

    return stats;
  }
}
