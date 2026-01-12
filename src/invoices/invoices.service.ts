import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { ResolveInvoiceDto } from './dto/resolve-invoice.dto';
import { InvoiceResponseDto, InvoiceDetailResponseDto } from './dto/invoice-response.dto';
import { InvoiceStatsQueryDto, InvoiceStatsResponseDto } from './dto/invoice-stats.dto';
import { InvoicePdfService } from './invoice-pdf.service';
import { Prisma, InvoiceStatus, CommissionType, EnrollmentStatus, CommissionStatus } from '@prisma/client';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private invoicePdfService: InvoicePdfService,
  ) {}

  async findAll(queryDto: QueryInvoicesDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      status,
      enrollmentId,
      agentId,
      partnerId,
      dueDateFrom,
      dueDateTo,
      overdue,
      search,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: Prisma.InvoiceWhereInput = {
      ...(status && { status }),
      ...(enrollmentId && { enrollmentId }),
      ...(dueDateFrom && { dueDate: { gte: new Date(dueDateFrom) } }),
      ...(dueDateTo && { dueDate: { lte: new Date(dueDateTo) } }),
      ...(overdue === true && {
        status: InvoiceStatus.OVERDUE,
        dueDate: { lt: now },
      }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { enrollmentId: { contains: search, mode: 'insensitive' } },
          { enrollment: { client: { firstName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { lastName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { otherName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { user: { email: { contains: search, mode: 'insensitive' } } } } },
          { enrollment: { agent: { firstName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { agent: { lastName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { agent: { otherName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { partner: { firstName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { partner: { lastName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { partner: { otherName: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { property: { name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    };

    // Apply agent filter
    if (agentId) {
      if (!where.enrollment) {
        where.enrollment = {};
      }
      (where.enrollment as any).agentId = agentId;
    }

    // Apply partner filter
    if (partnerId) {
      if (!where.enrollment) {
        where.enrollment = {};
      }
      (where.enrollment as any).partnerId = partnerId;
    }

    // Apply role-based filtering
    if (userRole === 'agent') {
      if (!where.enrollment) {
        where.enrollment = {};
      }
      (where.enrollment as any).agentId = userId;
    } else if (userRole === 'client') {
      if (!where.enrollment) {
        where.enrollment = {};
      }
      (where.enrollment as any).clientId = userId;
    } else if (userRole === 'partner') {
      if (!where.enrollment) {
        where.enrollment = {};
      }
      (where.enrollment as any).partnerId = userId;
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          enrollment: {
            include: {
              property: { select: { name: true } },
              agent: { select: { firstName: true, lastName: true, otherName: true } },
              client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
              partner: { select: { firstName: true, lastName: true, otherName: true } },
            },
          },
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    const formattedInvoices: InvoiceResponseDto[] = invoices.map(invoice => {
      const overdueDays = invoice.status === InvoiceStatus.OVERDUE
        ? Math.max(0, Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: invoice.id,
        enrollmentId: invoice.enrollmentId,
        installmentNumber: invoice.installmentNumber,
        dueDate: invoice.dueDate,
        amount: Number(invoice.amount),
        amountPaid: Number(invoice.amountPaid),
        status: invoice.status as any,
        overdueDate: invoice.overdueDate,
        overdueFee: Number(invoice.overdueFee),
        overdueDays,
        paidAt: invoice.paidAt,
        paymentReference: invoice.paymentReference,
        propertyName: invoice.enrollment.property.name,
        clientName: formatFullName(invoice.enrollment.client?.firstName, invoice.enrollment.client?.lastName, invoice.enrollment.client?.otherName),
        clientEmail: invoice.enrollment.client?.user?.email,
        agentName: formatFullName(invoice.enrollment.agent.firstName, invoice.enrollment.agent.lastName, invoice.enrollment.agent.otherName),
        partnerName: formatFullName(invoice.enrollment.partner?.firstName, invoice.enrollment.partner?.lastName, invoice.enrollment.partner?.otherName),
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      };
    });

    return {
      data: formattedInvoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            property: { select: { id: true, name: true } },
            agent: { select: { id: true, firstName: true, lastName: true, otherName: true } },
            client: { select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
            partner: { select: { firstName: true, lastName: true, otherName: true } },
            invoices: {
              select: {
                id: true,
                installmentNumber: true,
                status: true,
                amountPaid: true,
                paidAt: true,
                paymentReference: true,
              },
              orderBy: { installmentNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check access rights
    if (userRole === 'agent' && invoice.enrollment.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    if (userRole === 'client' && invoice.enrollment.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    if (userRole === 'partner' && invoice.enrollment.partnerId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    const now = new Date();
    const overdueDays = invoice.status === InvoiceStatus.OVERDUE
      ? Math.max(0, Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const paymentHistory = invoice.enrollment.invoices
      .filter(inv => inv.status === InvoiceStatus.PAID && inv.paidAt)
      .map(inv => ({
        amount: Number(inv.amountPaid),
        paidAt: inv.paidAt!,
        reference: inv.paymentReference || '',
      }));

    const response: InvoiceDetailResponseDto = {
      id: invoice.id,
      enrollmentId: invoice.enrollmentId,
      installmentNumber: invoice.installmentNumber,
      dueDate: invoice.dueDate,
      amount: Number(invoice.amount),
      amountPaid: Number(invoice.amountPaid),
      status: invoice.status as any,
      overdueDate: invoice.overdueDate,
      overdueFee: Number(invoice.overdueFee),
      overdueDays,
      paidAt: invoice.paidAt,
      paymentReference: invoice.paymentReference,
      propertyName: invoice.enrollment.property.name,
      clientName: formatFullName(invoice.enrollment.client?.firstName, invoice.enrollment.client?.lastName, invoice.enrollment.client?.otherName),
      clientEmail: invoice.enrollment.client?.user?.email,
      agentName: formatFullName(invoice.enrollment.agent.firstName, invoice.enrollment.agent.lastName, invoice.enrollment.agent.otherName),
      partnerName: formatFullName(invoice.enrollment.partner?.firstName, invoice.enrollment.partner?.lastName, invoice.enrollment.partner?.otherName),
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      enrollment: {
        id: invoice.enrollment.id,
        propertyId: invoice.enrollment.propertyId,
        propertyName: invoice.enrollment.property.name,
        agentId: invoice.enrollment.agentId,
        agentName: formatFullName(invoice.enrollment.agent.firstName, invoice.enrollment.agent.lastName, invoice.enrollment.agent.otherName),
        clientId: invoice.enrollment.clientId,
        clientName: formatFullName(invoice.enrollment.client?.firstName, invoice.enrollment.client?.lastName, invoice.enrollment.client?.otherName),
        totalAmount: Number(invoice.enrollment.totalAmount),
        amountPaid: Number(invoice.enrollment.amountPaid),
        status: invoice.enrollment.status,
      },
      paymentHistory,
    };

    return response;
  }

  async resolve(id: string, resolveDto: ResolveInvoiceDto, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            property: true,
            agent: { select: { firstName: true, lastName: true, otherName: true } },
            client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
            partner: { select: { firstName: true, lastName: true, otherName: true } },
            invoices: {
              orderBy: { installmentNumber: 'asc' },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot resolve a cancelled invoice');
    }

    // Validate sequential payment: previous invoices must be paid first
    const previousInvoices = invoice.enrollment.invoices.filter(
      inv => inv.installmentNumber < invoice.installmentNumber
    );

    const unpaidPreviousInvoices = previousInvoices.filter(
      inv => inv.status !== InvoiceStatus.PAID
    );

    if (unpaidPreviousInvoices.length > 0) {
      throw new BadRequestException(
        `Cannot pay invoice ${invoice.installmentNumber}. Previous invoice(s) must be paid first: ${unpaidPreviousInvoices.map(inv => `#${inv.installmentNumber}`).join(', ')}`
      );
    }

    // Calculate overdue fee if applicable
    let overdueFee = 0;
    const now = new Date();
    if (invoice.status === InvoiceStatus.OVERDUE && invoice.dueDate < now) {
      overdueFee = Number(invoice.enrollment.property.overdueInterestRate);
    }

    const totalAmount = Number(invoice.amount) + overdueFee;

    return await this.prisma.$transaction(async (prisma) => {
      // Update invoice
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: InvoiceStatus.PAID,
          amountPaid: invoice.amount,
          overdueFee,
          paidAt: now,
          paymentReference: resolveDto.paymentReference,
        },
        include: {
          enrollment: {
            include: {
              property: { select: { name: true } },
              agent: { select: { firstName: true, lastName: true, otherName: true } },
              client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
              partner: { select: { firstName: true, lastName: true, otherName: true } },
            },
          },
        },
      });

      // Update enrollment amountPaid
      const newAmountPaid = Number(invoice.enrollment.amountPaid) + Number(invoice.amount);

      // Check if all invoices are paid
      const allInvoices = invoice.enrollment.invoices;
      const allPaid = allInvoices.every(
        inv => inv.id === id || inv.status === InvoiceStatus.PAID
      );

      await prisma.enrollment.update({
        where: { id: invoice.enrollmentId },
        data: {
          amountPaid: newAmountPaid,
          status: allPaid ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ONGOING,
        },
      });

      // Create commission records
      const commissions = [];

      // Agent commission: 7%
      const agentCommissionAmount = Number(invoice.amount) * 0.07;
      commissions.push({
        enrollmentId: invoice.enrollmentId,
        invoiceId: invoice.id,
        agentId: invoice.enrollment.agentId,
        type: CommissionType.AGENT,
        percentage: 7,
        amount: agentCommissionAmount,
        status: CommissionStatus.PENDING,
      });

      // Partner commission: 3% (if applicable)
      if (invoice.enrollment.partnerId) {
        const partnerCommissionAmount = Number(invoice.amount) * 0.03;
        commissions.push({
          enrollmentId: invoice.enrollmentId,
          invoiceId: invoice.id,
          partnerId: invoice.enrollment.partnerId,
          type: CommissionType.PARTNER,
          percentage: 3,
          amount: partnerCommissionAmount,
          status: CommissionStatus.PENDING,
        });
      }

      await prisma.commission.createMany({
        data: commissions,
      });

      // Calculate overdue days
      const overdueDays = invoice.status === InvoiceStatus.OVERDUE
        ? Math.max(0, Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: updatedInvoice.id,
        enrollmentId: updatedInvoice.enrollmentId,
        installmentNumber: updatedInvoice.installmentNumber,
        dueDate: updatedInvoice.dueDate,
        amount: Number(updatedInvoice.amount),
        amountPaid: Number(updatedInvoice.amountPaid),
        status: updatedInvoice.status as any,
        overdueDate: updatedInvoice.overdueDate,
        overdueFee: Number(updatedInvoice.overdueFee),
        overdueDays,
        paidAt: updatedInvoice.paidAt,
        paymentReference: updatedInvoice.paymentReference,
        propertyName: updatedInvoice.enrollment.property.name,
        clientName: formatFullName(updatedInvoice.enrollment.client?.firstName, updatedInvoice.enrollment.client?.lastName, updatedInvoice.enrollment.client?.otherName),
        clientEmail: updatedInvoice.enrollment.client?.user?.email,
        agentName: formatFullName(updatedInvoice.enrollment.agent.firstName, updatedInvoice.enrollment.agent.lastName, updatedInvoice.enrollment.agent.otherName),
        partnerName: formatFullName(updatedInvoice.enrollment.partner?.firstName, updatedInvoice.enrollment.partner?.lastName, updatedInvoice.enrollment.partner?.otherName),
        createdAt: updatedInvoice.createdAt,
        updatedAt: updatedInvoice.updatedAt,
      };
    });
  }

  async undoPayment(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            property: { select: { name: true } },
            agent: { select: { firstName: true, lastName: true, otherName: true } },
            client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
            partner: { select: { firstName: true, lastName: true, otherName: true } },
            invoices: {
              orderBy: { installmentNumber: 'asc' },
            },
          },
        },
        commissions: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is not paid. Cannot undo payment.');
    }

    // Validate sequential rule: only allow undo if it's the most recent payment
    const paidInvoices = invoice.enrollment.invoices.filter(
      inv => inv.status === InvoiceStatus.PAID
    );

    const mostRecentPaidInvoice = paidInvoices.reduce((latest, inv) => {
      if (!latest) return inv;
      return inv.installmentNumber > latest.installmentNumber ? inv : latest;
    }, null);

    if (mostRecentPaidInvoice?.id !== invoice.id) {
      throw new BadRequestException(
        `Can only undo the most recent payment. Latest paid invoice is #${mostRecentPaidInvoice?.installmentNumber}`
      );
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Determine new status
      const now = new Date();
      const isOverdue = invoice.dueDate < now;
      const newStatus = isOverdue ? InvoiceStatus.OVERDUE : InvoiceStatus.PENDING;

      // Update invoice
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: newStatus,
          amountPaid: 0,
          paidAt: null,
          paymentReference: null,
          overdueFee: 0,
          overdueDate: isOverdue ? invoice.overdueDate : null,
        },
        include: {
          enrollment: {
            include: {
              property: { select: { name: true } },
              agent: { select: { firstName: true, lastName: true, otherName: true } },
              client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
              partner: { select: { firstName: true, lastName: true, otherName: true } },
            },
          },
        },
      });

      // Update enrollment
      const newAmountPaid = Number(invoice.enrollment.amountPaid) - Number(invoice.amount);
      await prisma.enrollment.update({
        where: { id: invoice.enrollmentId },
        data: {
          amountPaid: Math.max(0, newAmountPaid),
          status: EnrollmentStatus.ONGOING,
        },
      });

      // Delete commissions (they were pending and never paid)
      if (invoice.commissions.length > 0) {
        await prisma.commission.deleteMany({
          where: { invoiceId: invoice.id },
        });
      }

      const overdueDays = newStatus === InvoiceStatus.OVERDUE
        ? Math.max(0, Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: updatedInvoice.id,
        enrollmentId: updatedInvoice.enrollmentId,
        installmentNumber: updatedInvoice.installmentNumber,
        dueDate: updatedInvoice.dueDate,
        amount: Number(updatedInvoice.amount),
        amountPaid: Number(updatedInvoice.amountPaid),
        status: updatedInvoice.status as any,
        overdueDate: updatedInvoice.overdueDate,
        overdueFee: Number(updatedInvoice.overdueFee),
        overdueDays,
        paidAt: updatedInvoice.paidAt,
        paymentReference: updatedInvoice.paymentReference,
        propertyName: updatedInvoice.enrollment.property.name,
        clientName: formatFullName(updatedInvoice.enrollment.client?.firstName, updatedInvoice.enrollment.client?.lastName, updatedInvoice.enrollment.client?.otherName),
        clientEmail: updatedInvoice.enrollment.client?.user?.email,
        agentName: formatFullName(updatedInvoice.enrollment.agent.firstName, updatedInvoice.enrollment.agent.lastName, updatedInvoice.enrollment.agent.otherName),
        partnerName: formatFullName(updatedInvoice.enrollment.partner?.firstName, updatedInvoice.enrollment.partner?.lastName, updatedInvoice.enrollment.partner?.otherName),
        createdAt: updatedInvoice.createdAt,
        updatedAt: updatedInvoice.updatedAt,
      };
    });
  }

  async getStats(queryDto: InvoiceStatsQueryDto): Promise<InvoiceStatsResponseDto> {
    const { dateFrom, dateTo, propertyId, agentId, partnerId } = queryDto;

    // Build where clause for filtering
    const where: Prisma.InvoiceWhereInput = {
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    };

    // Apply filters through enrollment relation
    if (propertyId || agentId || partnerId) {
      where.enrollment = {
        ...(propertyId && { propertyId }),
        ...(agentId && { agentId }),
        ...(partnerId && { partnerId }),
      };
    }

    // Get counts for each status
    const [
      totalInvoices,
      totalPending,
      totalPaid,
      totalOverdue,
      totalCancelled,
      amountAggregates,
    ] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PENDING } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.OVERDUE } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.CANCELLED } }),
      this.prisma.invoice.aggregate({
        where,
        _sum: {
          amount: true,
          amountPaid: true,
        },
      }),
    ]);

    // Calculate amounts
    const totalAmountGenerated = Number(amountAggregates._sum.amount || 0);
    const totalAmountPaid = Number(amountAggregates._sum.amountPaid || 0);

    // Get pending amount (PENDING invoices)
    const pendingAggregates = await this.prisma.invoice.aggregate({
      where: { ...where, status: InvoiceStatus.PENDING },
      _sum: { amount: true },
    });
    const totalAmountPending = Number(pendingAggregates._sum.amount || 0);

    // Get overdue amount (OVERDUE invoices)
    const overdueAggregates = await this.prisma.invoice.aggregate({
      where: { ...where, status: InvoiceStatus.OVERDUE },
      _sum: { amount: true },
    });
    const totalAmountOverdue = Number(overdueAggregates._sum.amount || 0);

    return {
      totalInvoices,
      totalPending,
      totalPaid,
      totalOverdue,
      totalCancelled,
      totalAmountGenerated,
      totalAmountPending,
      totalAmountPaid,
      totalAmountOverdue,
    };
  }

  async downloadInvoice(id: string, userId?: string, userRole?: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            property: { select: { name: true } },
            agent: { select: { firstName: true, lastName: true, otherName: true } },
            client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
            partner: { select: { firstName: true, lastName: true, otherName: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Check access rights
    if (userRole === 'agent' && invoice.enrollment.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    if (userRole === 'client' && invoice.enrollment.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    if (userRole === 'partner' && invoice.enrollment.partnerId !== userId) {
      throw new ForbiddenException('You do not have access to this invoice');
    }

    // Prepare PDF data
    const pdfData = {
      invoiceId: invoice.id,
      invoiceNumber: invoice.installmentNumber,
      invoiceDate: invoice.createdAt,
      dueDate: invoice.dueDate,
      status: invoice.status,
      clientName: formatFullName(invoice.enrollment.client?.firstName, invoice.enrollment.client?.lastName, invoice.enrollment.client?.otherName),
      clientEmail: invoice.enrollment.client?.user?.email,
      propertyName: invoice.enrollment.property.name,
      agentName: formatFullName(invoice.enrollment.agent.firstName, invoice.enrollment.agent.lastName, invoice.enrollment.agent.otherName),
      partnerName: formatFullName(invoice.enrollment.partner?.firstName, invoice.enrollment.partner?.lastName, invoice.enrollment.partner?.otherName),
      installmentNumber: invoice.installmentNumber,
      amount: Number(invoice.amount),
      overdueFee: Number(invoice.overdueFee),
      totalAmount: Number(invoice.amount) + Number(invoice.overdueFee),
      amountPaid: Number(invoice.amountPaid),
      paidAt: invoice.paidAt || undefined,
      paymentReference: invoice.paymentReference || undefined,
    };

    return this.invoicePdfService.generateInvoicePdf(pdfData);
  }
}
