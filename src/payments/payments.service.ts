import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentResponseDto, PaymentVerificationDto } from './dto/payment-response.dto';
import { PaymentLinkResponseDto } from './dto/payment-link-response.dto';
import { PaystackWebhookPayload } from './dto/webhook-payload.dto';
import { InvoiceStatus, CommissionStatus, CommissionType, EnrollmentStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paystackSecretKey: string;
  private readonly paystackWebhookSecret: string;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.paystackSecretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    this.paystackWebhookSecret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET');
  }

  async initializePayment(
    initializeDto: InitializePaymentDto,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const { invoiceId, email, callbackUrl } = initializeDto;

    // Get invoice with enrollment details
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        enrollment: {
          include: {
            property: true,
            client: {
              select: {
                name: true,
                user: {
                  select: {
                    email: true
                  }
                }
              }
            },
            agent: { select: { name: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice has already been paid');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot pay a cancelled invoice');
    }

    // Validate sequential payment
    const previousInvoices = await this.prisma.invoice.findMany({
      where: {
        enrollmentId: invoice.enrollmentId,
        installmentNumber: { lt: invoice.installmentNumber },
      },
    });

    const unpaidPreviousInvoices = previousInvoices.filter(
      inv => inv.status !== InvoiceStatus.PAID,
    );

    if (unpaidPreviousInvoices.length > 0) {
      throw new BadRequestException(
        `Cannot pay invoice ${invoice.installmentNumber}. Previous invoice(s) must be paid first.`,
      );
    }

    // Determine customer email
    let customerEmail = email;
    if (!customerEmail && invoice.enrollment.client) {
      customerEmail = invoice.enrollment.client.user.email;
    }
    if (!customerEmail) {
      throw new BadRequestException('Customer email is required for payment');
    }

    // Calculate amount (add overdue fee if applicable)
    let overdueFee = 0;
    const now = new Date();
    if (invoice.status === InvoiceStatus.OVERDUE && invoice.dueDate < now) {
      overdueFee = Number(invoice.enrollment.property.overdueInterestRate);
    }

    const totalAmount = Number(invoice.amount) + overdueFee;
    const amountInKobo = Math.round(totalAmount * 100); // Paystack uses kobo (smallest currency unit)

    // Generate unique reference
    const reference = `INV-${invoice.id.substring(0, 8)}-${Date.now()}`;

    // Initialize Paystack transaction
    try {
      const response = await fetch(`${this.paystackBaseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: amountInKobo,
          reference,
          callback_url: callbackUrl || `${this.configService.get('FRONTEND_URL')}/payments/callback`,
          metadata: {
            invoiceId: invoice.id,
            enrollmentId: invoice.enrollmentId,
            installmentNumber: invoice.installmentNumber,
            propertyName: invoice.enrollment.property.name,
            overdueFee,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.status) {
        this.logger.error('Paystack initialization failed', data);
        throw new BadRequestException(data.message || 'Payment initialization failed');
      }

      // Update or create payment link record
      const existingLink = await this.prisma.paymentLink.findFirst({
        where: {
          invoiceId: invoice.id,
          isActive: true,
        },
      });

      if (existingLink) {
        await this.prisma.paymentLink.update({
          where: { id: existingLink.id },
          data: {
            paymentUrl: data.data.authorization_url,
            paystackReference: reference,
            isActive: true,
          },
        });
      } else {
        await this.prisma.paymentLink.create({
          data: {
            enrollmentId: invoice.enrollmentId,
            invoiceId: invoice.id,
            paymentUrl: data.data.authorization_url,
            paystackReference: reference,
            firstName: invoice.enrollment.client?.name?.split(' ')[0] || 'Customer',
            lastName: invoice.enrollment.client?.name?.split(' ').slice(1).join(' ') || '',
            token: crypto.randomBytes(32).toString('hex'),
            isActive: true,
            createdBy: userId || 'system',
          },
        });
      }

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference,
        invoiceId: invoice.id,
        amount: totalAmount,
      };
    } catch (error) {
      this.logger.error('Payment initialization error', error);
      throw new BadRequestException(
        error.message || 'Failed to initialize payment',
      );
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationDto> {
    try {
      const response = await fetch(
        `${this.paystackBaseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.status) {
        throw new BadRequestException(data.message || 'Payment verification failed');
      }

      const transaction = data.data;

      return {
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount / 100, // Convert from kobo to naira
        message: transaction.gateway_response,
        paidAt: transaction.paid_at ? new Date(transaction.paid_at) : undefined,
      };
    } catch (error) {
      this.logger.error('Payment verification error', error);
      throw new BadRequestException(
        error.message || 'Failed to verify payment',
      );
    }
  }

  async getPaymentLinkByToken(token: string): Promise<PaymentLinkResponseDto> {
    const paymentLink = await this.prisma.paymentLink.findFirst({
      where: { token },
      include: {
        invoice: true,
        enrollment: {
          include: {
            property: {
              select: {
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    // Check if link is expired
    if (paymentLink.expiresAt && paymentLink.expiresAt < new Date()) {
      throw new BadRequestException('Payment link has expired');
    }

    // Check if link is inactive
    if (!paymentLink.isActive) {
      throw new BadRequestException('Payment link is no longer active');
    }

    // Check if link has been used
    if (paymentLink.usedAt) {
      throw new BadRequestException('Payment link has already been used');
    }

    return {
      token: paymentLink.token,
      invoiceId: paymentLink.invoiceId,
      enrollmentId: paymentLink.enrollmentId,
      amount: Number(paymentLink.invoice.amount),
      dueDate: paymentLink.invoice.dueDate,
      installmentNumber: paymentLink.invoice.installmentNumber,
      propertyName: paymentLink.enrollment.property.name,
      propertyAddress: paymentLink.enrollment.property.address,
      paymentUrl: paymentLink.paymentUrl,
      isActive: paymentLink.isActive,
      expiresAt: paymentLink.expiresAt,
    };
  }

  async handleWebhook(payload: PaystackWebhookPayload, signature: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event, data } = payload;

    // Handle charge.success event
    if (event === 'charge.success' && data.status === 'success') {
      await this.processSuccessfulPayment(data);
    }

    this.logger.log(`Webhook processed: ${event}`);
  }

  private verifyWebhookSignature(payload: any, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.paystackWebhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }

  private async processSuccessfulPayment(transactionData: PaystackWebhookPayload['data']): Promise<void> {
    const { reference, metadata, amount, paid_at } = transactionData;
    const invoiceId = metadata?.invoiceId;

    if (!invoiceId) {
      this.logger.error('Invoice ID not found in webhook metadata');
      return;
    }

    // Check if payment already processed
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (existingInvoice?.status === InvoiceStatus.PAID) {
      this.logger.log(`Invoice ${invoiceId} already marked as paid`);
      return;
    }

    // Get invoice with enrollment
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        enrollment: {
          include: {
            property: true,
            invoices: { orderBy: { installmentNumber: 'asc' } },
          },
        },
      },
    });

    if (!invoice) {
      this.logger.error(`Invoice ${invoiceId} not found`);
      return;
    }

    const now = new Date(paid_at);

    // Calculate overdue fee if applicable
    let overdueFee = 0;
    if (invoice.status === InvoiceStatus.OVERDUE && invoice.dueDate < now) {
      overdueFee = Number(invoice.enrollment.property.overdueInterestRate);
    }

    // Process payment in transaction
    await this.prisma.$transaction(async (prisma) => {
      // Update invoice
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          amountPaid: invoice.amount,
          overdueFee,
          paidAt: now,
          paymentReference: reference,
        },
      });

      // Update enrollment
      const newAmountPaid = Number(invoice.enrollment.amountPaid) + Number(invoice.amount);
      const allInvoices = invoice.enrollment.invoices;
      const allPaid = allInvoices.every(
        inv => inv.id === invoiceId || inv.status === InvoiceStatus.PAID,
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

      // Deactivate payment link
      await prisma.paymentLink.updateMany({
        where: {
          invoiceId: invoice.id,
          isActive: true,
        },
        data: {
          isActive: false,
          usedAt: now,
        },
      });
    });

    this.logger.log(`Payment processed successfully for invoice ${invoiceId}`);
  }
}
