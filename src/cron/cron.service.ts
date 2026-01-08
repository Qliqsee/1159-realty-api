import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { InvoiceStatus, EnrollmentStatus } from '@prisma/client';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Runs daily at midnight to check for overdue invoices
   * Updates invoice status from PENDING to OVERDUE
   * Tracks grace period usage on enrollments
   * Suspends enrollments that exceed 32-day grace period
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueInvoices() {
    this.logger.log('Starting overdue invoice check...');

    const now = new Date();

    try {
      // Find all PENDING invoices past their due date
      const overdueInvoices = await this.prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            lt: now,
          },
        },
        include: {
          enrollment: {
            include: {
              invoices: {
                orderBy: { installmentNumber: 'asc' },
              },
              client: { select: { email: true, name: true } },
              agent: { select: { email: true, name: true } },
              property: { select: { name: true } },
            },
          },
        },
      });

      this.logger.log(`Found ${overdueInvoices.length} overdue invoices`);

      for (const invoice of overdueInvoices) {
        const { enrollment } = invoice;

        // Calculate days overdue for this invoice
        const daysOverdue = Math.floor(
          (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Update invoice to OVERDUE
        await this.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.OVERDUE,
            overdueDate: invoice.overdueDate || now,
          },
        });

        // Calculate total grace period days used across all overdue invoices
        const allOverdueInvoices = enrollment.invoices.filter(
          inv => inv.status === InvoiceStatus.OVERDUE || inv.id === invoice.id,
        );

        let totalGraceDaysUsed = 0;
        for (const overdueInv of allOverdueInvoices) {
          const invDueDate = overdueInv.id === invoice.id ? invoice.dueDate : overdueInv.dueDate;
          const invOverdueDate = overdueInv.id === invoice.id ? now : (overdueInv.overdueDate || overdueInv.dueDate);

          const invDaysOverdue = Math.floor(
            (now.getTime() - invDueDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          totalGraceDaysUsed += invDaysOverdue;
        }

        // Update enrollment with grace period usage
        const updateData: any = {
          gracePeriodDaysUsed: totalGraceDaysUsed,
        };

        // Suspend enrollment if grace period exceeds 32 days
        if (totalGraceDaysUsed > 32 && enrollment.status === EnrollmentStatus.ONGOING) {
          updateData.status = EnrollmentStatus.SUSPENDED;
          updateData.suspendedAt = now;

          this.logger.warn(
            `Enrollment ${enrollment.id} suspended after ${totalGraceDaysUsed} days of grace period`,
          );
        }

        await this.prisma.enrollment.update({
          where: { id: enrollment.id },
          data: updateData,
        });

        // Send overdue notification emails
        const clientEmail = enrollment.client?.email;
        const clientName = enrollment.client?.name || 'Valued Client';
        const agentEmail = enrollment.agent?.email;
        const agentName = enrollment.agent?.name || 'Agent';
        const propertyName = enrollment.property?.name || 'Property';
        const gracePeriodRemaining = Math.max(0, 32 - totalGraceDaysUsed);

        // Send to client if available
        if (clientEmail) {
          try {
            await this.emailService.sendInvoiceOverdueEmail(
              clientEmail,
              clientName,
              propertyName,
              invoice.installmentNumber,
              Number(invoice.amount),
              invoice.dueDate,
              daysOverdue,
              gracePeriodRemaining,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send overdue email to client ${clientEmail}`,
              error,
            );
          }
        }

        // Send to agent
        if (agentEmail) {
          try {
            await this.emailService.sendInvoiceOverdueEmail(
              agentEmail,
              agentName,
              propertyName,
              invoice.installmentNumber,
              Number(invoice.amount),
              invoice.dueDate,
              daysOverdue,
              gracePeriodRemaining,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send overdue email to agent ${agentEmail}`,
              error,
            );
          }
        }

        this.logger.log(
          `Invoice ${invoice.id} (Installment #${invoice.installmentNumber}) marked OVERDUE - ${daysOverdue} days past due`,
        );
      }

      this.logger.log(`Overdue invoice check completed. Updated ${overdueInvoices.length} invoices`);
    } catch (error) {
      this.logger.error('Error processing overdue invoices', error);
    }
  }

  /**
   * Runs every hour to check for invoices approaching due date
   * This can be used for sending reminder emails (future feature)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleUpcomingDueInvoices() {
    this.logger.debug('Checking for invoices approaching due date...');

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    try {
      const upcomingInvoices = await this.prisma.invoice.findMany({
        where: {
          status: InvoiceStatus.PENDING,
          dueDate: {
            gte: now,
            lte: threeDaysFromNow,
          },
        },
        include: {
          enrollment: {
            include: {
              client: { select: { email: true, name: true } },
              agent: { select: { email: true, name: true } },
              property: { select: { name: true } },
            },
          },
        },
      });

      this.logger.debug(`Found ${upcomingInvoices.length} invoices due in the next 3 days`);

      // Send reminder emails to clients and agents
      for (const invoice of upcomingInvoices) {
        const { enrollment } = invoice;
        const clientEmail = enrollment.client?.email;
        const clientName = enrollment.client?.name || 'Valued Client';
        const agentEmail = enrollment.agent?.email;
        const agentName = enrollment.agent?.name || 'Agent';
        const propertyName = enrollment.property?.name || 'Property';

        const daysUntilDue = Math.ceil(
          (invoice.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Send reminder to client if available
        if (clientEmail) {
          try {
            await this.emailService.sendInvoiceReminderEmail(
              clientEmail,
              clientName,
              propertyName,
              invoice.installmentNumber,
              Number(invoice.amount),
              invoice.dueDate,
              daysUntilDue,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send reminder email to client ${clientEmail}`,
              error,
            );
          }
        }

        // Send reminder to agent
        if (agentEmail) {
          try {
            await this.emailService.sendInvoiceReminderEmail(
              agentEmail,
              agentName,
              propertyName,
              invoice.installmentNumber,
              Number(invoice.amount),
              invoice.dueDate,
              daysUntilDue,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send reminder email to agent ${agentEmail}`,
              error,
            );
          }
        }
      }

      this.logger.log(
        `Sent reminder emails for ${upcomingInvoices.length} upcoming invoices`,
      );
    } catch (error) {
      this.logger.error('Error checking upcoming due invoices', error);
    }
  }
}
