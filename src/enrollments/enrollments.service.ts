import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';
import { LinkClientDto } from './dto/link-client.dto';
import { GeneratePaymentLinkDto, PaymentLinkResponseDto } from './dto/generate-payment-link.dto';
import { EnrollmentDetailDto } from './dto/enrollment-detail.dto';
import { EnrollmentStatsDto } from './dto/enrollment-stats.dto';
import { EnrollmentDashboardDto } from './dto/enrollment-dashboard.dto';
import { Prisma } from '@prisma/client';
import * as crypto from 'crypto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, userId: string, userRole: string) {
    const {
      propertyId,
      unitId,
      agentId,
      clientId,
      paymentType,
      selectedPaymentPlanId,
      outrightInstallments,
      selectedUnit,
      enrollmentDate,
    } = createEnrollmentDto;

    // Validate property exists and is available
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        unitPricing: true,
        paymentPlans: true,
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.status === 'ARCHIVED' || property.status === 'SOLD_OUT') {
      throw new BadRequestException(`Property is ${property.status.toLowerCase()} and cannot be enrolled`);
    }

    // Validate unit if provided
    if (unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit || unit.propertyId !== propertyId) {
        throw new BadRequestException('Unit does not belong to the specified property');
      }

      if (unit.status !== 'AVAILABLE') {
        throw new BadRequestException('Unit is not available');
      }
    }

    // Determine agent ID
    let finalAgentId = agentId;
    if (userRole === 'agent') {
      finalAgentId = userId;
    } else if (!agentId) {
      throw new BadRequestException('Agent ID is required');
    }

    // Validate agent exists
    const agent = await this.prisma.admin.findUnique({
      where: { id: finalAgentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (!agent.canOnboardClients) {
      throw new BadRequestException('Agent is not authorized to create enrollments');
    }

    // Validate client if provided
    let partnerId: string | undefined;
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        include: {
          kyc: true,
          referredByPartner: {
            include: {
              partnership: true,
            },
          },
        },
      });

      if (!client) {
        throw new NotFoundException('Client not found');
      }

      // Check if client has completed KYC step 1
      if (!client.hasCompletedOnboarding) {
        throw new BadRequestException('Client has not completed onboarding (KYC Step 1)');
      }

      // Check for duplicate enrollment
      const existingEnrollment = await this.prisma.enrollment.findFirst({
        where: {
          clientId,
          propertyId,
          status: {
            notIn: ['CANCELLED'],
          },
        },
      });

      if (existingEnrollment) {
        throw new BadRequestException('Client already has an enrollment for this property');
      }

      // Auto-populate partner ID if client was referred by an approved partner
      if (client.referredByPartnerId && client.referredByPartner?.partnership?.status === 'APPROVED') {
        // Check if partner is not suspended
        const partnerSuspended = !!client.referredByPartner.partnership.suspendedAt;
        if (!partnerSuspended) {
          partnerId = client.referredByPartnerId;
        }
      }
    }

    // Find unit pricing
    const unitPricing = property.unitPricing.find(up => up.unit === selectedUnit);
    if (!unitPricing) {
      throw new BadRequestException('Selected unit pricing not found');
    }

    // Calculate total amount and validate payment plan
    let totalAmount: number;
    let paymentPlan: any;
    let numberOfInstallments: number;
    let interestRate = 0;

    if (paymentType === 'INSTALLMENT') {
      if (!selectedPaymentPlanId) {
        throw new BadRequestException('Payment plan ID is required for installment payment');
      }

      paymentPlan = property.paymentPlans.find(pp => pp.id === selectedPaymentPlanId);
      if (!paymentPlan) {
        throw new BadRequestException('Selected payment plan does not belong to this property');
      }

      interestRate = Number(paymentPlan.interestRate);
      numberOfInstallments = paymentPlan.durationMonths / property.paymentCycle;

      // Apply sales discount if active
      let basePrice = property.status === 'PRE_LAUNCH'
        ? Number(unitPricing.prelaunchPrice)
        : Number(unitPricing.regularPrice);

      if (property.salesDiscountIsActive && property.salesDiscountPercentage) {
        const discount = (basePrice * Number(property.salesDiscountPercentage)) / 100;
        basePrice = basePrice - discount;
      }

      // Calculate with interest
      totalAmount = basePrice * (1 + interestRate / 100);
    } else {
      // Outright payment
      const installments = outrightInstallments || 1;
      if (installments > 3) {
        throw new BadRequestException('Outright payment can only be split into maximum 3 installments');
      }

      numberOfInstallments = installments;

      // Apply sales discount if active
      let basePrice = property.status === 'PRE_LAUNCH'
        ? Number(unitPricing.prelaunchPrice)
        : Number(unitPricing.regularPrice);

      if (property.salesDiscountIsActive && property.salesDiscountPercentage) {
        const discount = (basePrice * Number(property.salesDiscountPercentage)) / 100;
        basePrice = basePrice - discount;
      }

      totalAmount = basePrice;
    }

    // Create enrollment and invoices in a transaction
    const enrollment = await this.prisma.$transaction(async (prisma) => {
      const newEnrollment = await prisma.enrollment.create({
        data: {
          propertyId,
          unitId,
          agentId: finalAgentId,
          clientId,
          partnerId,
          paymentType,
          selectedPaymentPlanId,
          totalAmount,
          enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
          createdBy: userId,
        },
        include: {
          property: true,
          agent: true,
          client: true,
          partner: true,
        },
      });

      // Calculate installment amount
      const installmentAmount = totalAmount / numberOfInstallments;
      const paymentCycleDays = property.paymentCycle * 30; // Convert months to days

      // Generate invoices
      const invoices = [];
      for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = new Date(newEnrollment.enrollmentDate);
        dueDate.setDate(dueDate.getDate() + (i * paymentCycleDays));

        invoices.push({
          enrollmentId: newEnrollment.id,
          installmentNumber: i + 1,
          dueDate,
          amount: installmentAmount,
        });
      }

      await prisma.invoice.createMany({
        data: invoices,
      });

      // Update unit status if unit is selected
      if (unitId) {
        await prisma.unit.update({
          where: { id: unitId },
          data: { status: 'SOLD' },
        });
      }

      return newEnrollment;
    });

    return enrollment;
  }

  async findAll(queryDto: QueryEnrollmentsDto, userId?: string, userRole?: string) {
    const {
      page,
      limit,
      status,
      propertyId,
      agentId,
      clientId,
      paymentType,
      enrollmentDateFrom,
      enrollmentDateTo,
      search,
      sortBy,
      sortOrder,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.EnrollmentWhereInput = {
      ...(status && { status }),
      ...(propertyId && { propertyId }),
      ...(agentId && { agentId }),
      ...(clientId && { clientId }),
      ...(paymentType && { paymentType }),
      ...(enrollmentDateFrom && {
        enrollmentDate: { gte: new Date(enrollmentDateFrom) },
      }),
      ...(enrollmentDateTo && {
        enrollmentDate: { lte: new Date(enrollmentDateTo) },
      }),
      ...(search && {
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { property: { name: { contains: search, mode: 'insensitive' } } },
          { client: { firstName: { contains: search, mode: 'insensitive' } } },
          { client: { lastName: { contains: search, mode: 'insensitive' } } },
          { client: { otherName: { contains: search, mode: 'insensitive' } } },
          { client: { user: { email: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    };

    // Apply role-based filtering
    if (userRole === 'agent') {
      where.agentId = userId;
    } else if (userRole === 'client') {
      where.clientId = userId;
    }

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          property: { select: { name: true } },
          agent: { select: { firstName: true, lastName: true, otherName: true } },
          client: { select: { firstName: true, lastName: true, otherName: true, user: { select: { email: true } } } },
          partner: { select: { firstName: true, lastName: true, otherName: true } },
          unit: { select: { unitId: true } },
          invoices: {
            select: {
              status: true,
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    const formattedEnrollments = enrollments.map(enrollment => {
      const totalInstallments = enrollment.invoices.length;
      const paidInstallments = enrollment.invoices.filter(
        inv => inv.status === 'PAID',
      ).length;
      const overdueInstallments = enrollment.invoices.filter(
        inv => inv.status === 'OVERDUE',
      ).length;
      const pendingInstallments = enrollment.invoices.filter(
        inv => inv.status === 'PENDING',
      ).length;

      return {
        id: enrollment.id,
        propertyId: enrollment.propertyId,
        propertyName: enrollment.property.name,
        unitId: enrollment.unitId,
        unitNumber: enrollment.unit?.unitId,
        agentId: enrollment.agentId,
        agentName: formatFullName(enrollment.agent.firstName, enrollment.agent.lastName, enrollment.agent.otherName),
        clientId: enrollment.clientId,
        clientName: enrollment.client ? formatFullName(enrollment.client.firstName, enrollment.client.lastName, enrollment.client.otherName) : null,
        clientEmail: enrollment.client?.user?.email,
        partnerId: enrollment.partnerId,
        partnerName: enrollment.partner ? formatFullName(enrollment.partner.firstName, enrollment.partner.lastName, enrollment.partner.otherName) : null,
        paymentType: enrollment.paymentType,
        selectedPaymentPlanId: enrollment.selectedPaymentPlanId,
        totalAmount: Number(enrollment.totalAmount),
        amountPaid: Number(enrollment.amountPaid),
        status: enrollment.status,
        gracePeriodDaysUsed: enrollment.gracePeriodDaysUsed,
        enrollmentDate: enrollment.enrollmentDate,
        totalInstallments,
        paidInstallments,
        overdueInstallments,
        pendingInstallments,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      };
    });

    return {
      data: formattedEnrollments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId?: string, userRole?: string): Promise<EnrollmentDetailDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        agent: { include: { user: { select: { email: true } } } },
        client: { include: { user: { select: { email: true } } } },
        partner: { include: { user: { select: { email: true } } } },
        paymentPlan: true,
        invoices: {
          orderBy: { installmentNumber: 'asc' },
        },
        commissions: {
          where: userRole === 'agent' ? { agentId: userId } : userRole === 'partner' ? { partnerId: userId } : {},
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Check access rights
    if (userRole === 'agent' && enrollment.agentId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    if (userRole === 'client' && enrollment.clientId !== userId) {
      throw new ForbiddenException('You do not have access to this enrollment');
    }

    // Calculate stats
    const totalInstallments = enrollment.invoices.length;
    const completedInstallments = enrollment.invoices.filter(
      inv => inv.status === 'PAID',
    ).length;
    const overdueInstallments = enrollment.invoices.filter(
      inv => inv.status === 'OVERDUE',
    ).length;
    const pendingInstallments = enrollment.invoices.filter(
      inv => inv.status === 'PENDING',
    ).length;

    // Find next installment
    const nextInstallment = enrollment.invoices.find(
      inv => inv.status === 'PENDING' || inv.status === 'OVERDUE',
    );

    const now = new Date();
    const daysUntilNextDue = nextInstallment
      ? Math.ceil((nextInstallment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Format invoices with overdue days
    const formattedInvoices = enrollment.invoices.map(invoice => {
      const overdueDays =
        invoice.status === 'OVERDUE' && invoice.dueDate
          ? Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0;

      return {
        id: invoice.id,
        installmentNumber: invoice.installmentNumber,
        dueDate: invoice.dueDate,
        amount: Number(invoice.amount),
        amountPaid: Number(invoice.amountPaid),
        status: invoice.status,
        overdueDate: invoice.overdueDate,
        overdueFee: Number(invoice.overdueFee),
        overdueDays,
        paidAt: invoice.paidAt,
        paymentReference: invoice.paymentReference,
      };
    });

    // Format commissions (only show to agents/admins)
    const formattedCommissions =
      userRole !== 'client'
        ? enrollment.commissions.map(commission => ({
            id: commission.id,
            type: commission.type,
            percentage: Number(commission.percentage),
            amount: Number(commission.amount),
            status: commission.status,
            dueDate: commission.dueDate,
            paidAt: commission.paidAt,
          }))
        : undefined;

    return {
      id: enrollment.id,
      property: {
        id: enrollment.property.id,
        name: enrollment.property.name,
        type: enrollment.property.type,
        address: enrollment.property.address,
      },
      unit: enrollment.unit
        ? {
            id: enrollment.unit.id,
            unitId: enrollment.unit.unitId,
            unit: enrollment.unit.unit,
            feature: enrollment.unit.feature,
          }
        : undefined,
      agent: {
        id: enrollment.agent.id,
        name: formatFullName(enrollment.agent.firstName, enrollment.agent.lastName, enrollment.agent.otherName),
        email: enrollment.agent.user.email,
      },
      client: enrollment.client
        ? {
            id: enrollment.client.id,
            name: formatFullName(enrollment.client.firstName, enrollment.client.lastName, enrollment.client.otherName),
            email: enrollment.client.user.email,
          }
        : undefined,
      partner: enrollment.partner
        ? {
            id: enrollment.partner.id,
            name: formatFullName(enrollment.partner.firstName, enrollment.partner.lastName, enrollment.partner.otherName),
            email: enrollment.partner.user.email,
          }
        : undefined,
      paymentType: enrollment.paymentType,
      paymentPlan: enrollment.paymentPlan
        ? {
            id: enrollment.paymentPlan.id,
            durationMonths: enrollment.paymentPlan.durationMonths,
            interestRate: Number(enrollment.paymentPlan.interestRate),
          }
        : undefined,
      totalAmount: Number(enrollment.totalAmount),
      amountPaid: Number(enrollment.amountPaid),
      status: enrollment.status,
      gracePeriodDaysUsed: enrollment.gracePeriodDaysUsed,
      gracePeriodRemaining: Math.max(0, 32 - enrollment.gracePeriodDaysUsed),
      enrollmentDate: enrollment.enrollmentDate,
      invoices: formattedInvoices,
      commissions: formattedCommissions,
      totalInstallments,
      completedInstallments,
      overdueInstallments,
      pendingInstallments,
      nextInstallmentDueDate: nextInstallment?.dueDate,
      nextInstallmentAmount: nextInstallment ? Number(nextInstallment.amount) : undefined,
      daysUntilNextDue,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      cancelledAt: enrollment.cancelledAt,
      cancelledBy: enrollment.cancelledBy,
      suspendedAt: enrollment.suspendedAt,
      resumedAt: enrollment.resumedAt,
    };
  }

  async cancel(id: string, userId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        invoices: {
          include: {
            commissions: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === 'CANCELLED') {
      throw new BadRequestException('Enrollment is already cancelled');
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      const now = new Date();

      // Get all unpaid invoices (PENDING, OVERDUE)
      const unpaidInvoices = enrollment.invoices.filter(
        inv => inv.status === 'PENDING' || inv.status === 'OVERDUE'
      );

      // Cancel all unpaid invoices
      if (unpaidInvoices.length > 0) {
        await prisma.invoice.updateMany({
          where: {
            id: { in: unpaidInvoices.map(inv => inv.id) },
          },
          data: {
            status: 'CANCELLED',
          },
        });

        // Get all pending commissions from unpaid invoices
        const unpaidInvoiceIds = unpaidInvoices.map(inv => inv.id);

        // Delete all pending commissions linked to cancelled invoices
        await prisma.commission.deleteMany({
          where: {
            invoiceId: { in: unpaidInvoiceIds },
            status: 'PENDING',
          },
        });
      }

      // Update enrollment status
      return prisma.enrollment.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          cancelledAt: now,
          cancelledBy: userId,
        },
      });
    });
  }

  async resume(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status !== 'SUSPENDED') {
      throw new BadRequestException('Only suspended enrollments can be resumed');
    }

    return this.prisma.enrollment.update({
      where: { id },
      data: {
        status: 'ONGOING',
        gracePeriodDaysUsed: 0,
        resumedAt: new Date(),
      },
    });
  }

  async linkClient(id: string, linkClientDto: LinkClientDto) {
    const { clientId } = linkClientDto;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.clientId) {
      throw new BadRequestException('Enrollment already has a client linked');
    }

    // Validate client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        referredByPartner: {
          include: {
            partnership: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Check for duplicate enrollment
    const existingEnrollment = await this.prisma.enrollment.findFirst({
      where: {
        clientId,
        propertyId: enrollment.propertyId,
        status: { notIn: ['CANCELLED'] },
        id: { not: id },
      },
    });

    if (existingEnrollment) {
      throw new BadRequestException('Client already has an enrollment for this property');
    }

    // Determine partner ID based on who referred the client
    let partnerId: string | null = null;
    if (client.referredByPartnerId && client.referredByPartner?.partnership?.status === 'APPROVED') {
      const partnerSuspended = !!client.referredByPartner.partnership.suspendedAt;
      if (!partnerSuspended) {
        partnerId = client.referredByPartnerId;
      }
    }

    // Update enrollment and disable payment links
    return this.prisma.$transaction(async (prisma) => {
      const updated = await prisma.enrollment.update({
        where: { id },
        data: {
          clientId,
          partnerId,
        },
      });

      // Disable all active payment links
      await prisma.paymentLink.updateMany({
        where: {
          enrollmentId: id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      return updated;
    });
  }

  async generatePaymentLink(
    id: string,
    generateDto: GeneratePaymentLinkDto,
    userId: string,
  ): Promise<PaymentLinkResponseDto> {
    const { firstName, lastName, invoiceId } = generateDto;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      include: {
        client: true,
        invoices: {
          orderBy: { installmentNumber: 'asc' },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // If no client, require firstName and lastName
    if (!enrollment.clientId && (!firstName || !lastName)) {
      throw new BadRequestException('First name and last name are required when no client is linked');
    }

    // Find the invoice to generate link for
    let targetInvoice;
    if (invoiceId) {
      targetInvoice = enrollment.invoices.find(inv => inv.id === invoiceId);
      if (!targetInvoice) {
        throw new NotFoundException('Invoice not found');
      }
    } else {
      // Default to first unpaid invoice
      targetInvoice = enrollment.invoices.find(
        inv => inv.status === 'PENDING' || inv.status === 'OVERDUE',
      );
      if (!targetInvoice) {
        throw new BadRequestException('No unpaid invoices found');
      }
    }

    // Check if previous invoices are paid (sequential payment validation)
    if (targetInvoice.installmentNumber > 1) {
      const previousInvoice = enrollment.invoices.find(
        inv => inv.installmentNumber === targetInvoice.installmentNumber - 1,
      );
      if (previousInvoice && previousInvoice.status !== 'PAID') {
        throw new BadRequestException('Previous invoices must be paid first');
      }
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Link expires in 30 days

    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        enrollmentId: id,
        invoiceId: targetInvoice.id,
        firstName: firstName || enrollment.client?.firstName || 'Client',
        lastName: lastName || enrollment.client?.lastName || '',
        token,
        expiresAt,
        isActive: true,
        createdBy: userId,
      },
    });

    const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${token}`;

    return {
      token,
      paymentUrl,
      expiresAt,
      enrollmentId: id,
      invoiceId: targetInvoice.id,
    };
  }

  async getStats(dateFrom?: string, dateTo?: string, agentId?: string, propertyId?: string): Promise<EnrollmentStatsDto> {
    const where: Prisma.EnrollmentWhereInput = {
      ...(dateFrom && { enrollmentDate: { gte: new Date(dateFrom) } }),
      ...(dateTo && { enrollmentDate: { lte: new Date(dateTo) } }),
      ...(agentId && { agentId }),
      ...(propertyId && { propertyId }),
    };

    const [
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      revenueData,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.count({ where: { ...where, status: 'ONGOING' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'SUSPENDED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.enrollment.aggregate({
        where,
        _sum: {
          totalAmount: true,
          amountPaid: true,
        },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.totalAmount || 0);
    const collectedRevenue = Number(revenueData._sum.amountPaid || 0);
    const pendingRevenue = totalRevenue - collectedRevenue;

    return {
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
    };
  }

  async getMyStats(agentId: string): Promise<EnrollmentStatsDto> {
    const where: Prisma.EnrollmentWhereInput = {
      agentId,
    };

    const [
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      revenueData,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.count({ where: { ...where, status: 'ONGOING' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'SUSPENDED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.enrollment.aggregate({
        where,
        _sum: {
          totalAmount: true,
          amountPaid: true,
        },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.totalAmount || 0);
    const collectedRevenue = Number(revenueData._sum.amountPaid || 0);
    const pendingRevenue = totalRevenue - collectedRevenue;

    return {
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
    };
  }

  async getDashboard(
    userId: string,
    userRole: string,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<EnrollmentDashboardDto> {
    // Build where clause based on role
    const where: Prisma.EnrollmentWhereInput = {};

    if (userRole === 'agent') {
      where.agentId = userId;
    } else if (userRole === 'partner') {
      where.partnerId = userId;
    }
    // Admin sees all

    if (dateFrom && dateTo) {
      where.enrollmentDate = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    } else if (dateFrom) {
      where.enrollmentDate = { gte: new Date(dateFrom) };
    } else if (dateTo) {
      where.enrollmentDate = { lte: new Date(dateTo) };
    }

    // Get enrollment stats
    const [
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      revenueData,
      enrollments,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where }),
      this.prisma.enrollment.count({ where: { ...where, status: 'ONGOING' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'SUSPENDED' } }),
      this.prisma.enrollment.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.enrollment.aggregate({
        where,
        _sum: {
          totalAmount: true,
          amountPaid: true,
        },
      }),
      this.prisma.enrollment.findMany({
        where,
        select: {
          enrollmentDate: true,
          amountPaid: true,
          commissions: {
            select: {
              amount: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(revenueData._sum.totalAmount || 0);
    const collectedRevenue = Number(revenueData._sum.amountPaid || 0);
    const pendingRevenue = totalRevenue - collectedRevenue;

    // Calculate commission stats
    const commissionWhere: Prisma.CommissionWhereInput = {};
    if (userRole === 'agent') {
      commissionWhere.agentId = userId;
    } else if (userRole === 'partner') {
      commissionWhere.partnerId = userId;
    }

    if (dateFrom || dateTo) {
      commissionWhere.createdAt = {};
      if (dateFrom) commissionWhere.createdAt.gte = new Date(dateFrom);
      if (dateTo) commissionWhere.createdAt.lte = new Date(dateTo);
    }

    const commissionData = await this.prisma.commission.aggregate({
      where: commissionWhere,
      _sum: {
        amount: true,
      },
    });

    const paidCommissionData = await this.prisma.commission.aggregate({
      where: { ...commissionWhere, status: 'PAID' },
      _sum: {
        amount: true,
      },
    });

    const totalCommissions = Number(commissionData._sum.amount || 0);
    const paidCommissions = Number(paidCommissionData._sum.amount || 0);
    const pendingCommissions = totalCommissions - paidCommissions;

    // Calculate monthly trends (last 12 months or within date range)
    const trendsStartDate = dateFrom
      ? new Date(dateFrom)
      : new Date(new Date().setMonth(new Date().getMonth() - 12));
    const trendsEndDate = dateTo ? new Date(dateTo) : new Date();

    const monthlyMap = new Map<string, { enrollments: number; revenue: number; commissions: number }>();

    enrollments.forEach((enrollment) => {
      const month = enrollment.enrollmentDate.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { enrollments: 0, revenue: 0, commissions: 0 });
      }
      const data = monthlyMap.get(month)!;
      data.enrollments += 1;
      data.revenue += Number(enrollment.amountPaid);

      // Sum commissions for this enrollment
      enrollment.commissions.forEach((comm) => {
        const commMonth = comm.createdAt.toISOString().substring(0, 7);
        if (commMonth === month) {
          data.commissions += Number(comm.amount);
        }
      });
    });

    const monthlyTrends = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        enrollments: data.enrollments,
        revenue: data.revenue,
        commissions: data.commissions,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Calculate average enrollment value
    const averageEnrollmentValue = totalEnrollments > 0 ? totalRevenue / totalEnrollments : 0;

    // Conversion rate from property interests (if agent)
    let conversionRate: number | undefined;
    if (userRole === 'agent') {
      const interestsCount = await this.prisma.propertyInterest.count({
        where: { agentId: userId },
      });
      if (interestsCount > 0) {
        conversionRate = (totalEnrollments / interestsCount) * 100;
      }
    }

    return {
      totalEnrollments,
      ongoingEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      totalRevenue,
      collectedRevenue,
      pendingRevenue,
      totalCommissions,
      paidCommissions,
      pendingCommissions,
      monthlyTrends,
      conversionRate,
      averageEnrollmentValue,
    };
  }
}
