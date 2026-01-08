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
import { Prisma, InvoiceStatus, CommissionType, EnrollmentStatus, CommissionStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(queryDto: QueryInvoicesDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      status,
      enrollmentId,
      agentId,
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
          { enrollment: { client: { name: { contains: search, mode: 'insensitive' } } } },
          { enrollment: { client: { email: { contains: search, mode: 'insensitive' } } } },
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
              agent: { select: { name: true } },
              client: { select: { name: true, email: true } },
              partner: { select: { name: true } },
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
        clientName: invoice.enrollment.client?.name,
        clientEmail: invoice.enrollment.client?.email,
        agentName: invoice.enrollment.agent.name,
        partnerName: invoice.enrollment.partner?.name,
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
            agent: { select: { id: true, name: true } },
            client: { select: { id: true, name: true, email: true } },
            partner: { select: { name: true } },
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
      clientName: invoice.enrollment.client?.name,
      clientEmail: invoice.enrollment.client?.email,
      agentName: invoice.enrollment.agent.name,
      partnerName: invoice.enrollment.partner?.name,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      enrollment: {
        id: invoice.enrollment.id,
        propertyId: invoice.enrollment.propertyId,
        propertyName: invoice.enrollment.property.name,
        agentId: invoice.enrollment.agentId,
        agentName: invoice.enrollment.agent.name,
        clientId: invoice.enrollment.clientId,
        clientName: invoice.enrollment.client?.name,
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
              agent: { select: { name: true } },
              client: { select: { name: true, email: true } },
              partner: { select: { name: true } },
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
        clientName: updatedInvoice.enrollment.client?.name,
        clientEmail: updatedInvoice.enrollment.client?.email,
        agentName: updatedInvoice.enrollment.agent.name,
        partnerName: updatedInvoice.enrollment.partner?.name,
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
            agent: { select: { name: true } },
            client: { select: { name: true, email: true } },
            partner: { select: { name: true } },
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
              agent: { select: { name: true } },
              client: { select: { name: true, email: true } },
              partner: { select: { name: true } },
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
        clientName: updatedInvoice.enrollment.client?.name,
        clientEmail: updatedInvoice.enrollment.client?.email,
        agentName: updatedInvoice.enrollment.agent.name,
        partnerName: updatedInvoice.enrollment.partner?.name,
        createdAt: updatedInvoice.createdAt,
        updatedAt: updatedInvoice.updatedAt,
      };
    });
  }
}
