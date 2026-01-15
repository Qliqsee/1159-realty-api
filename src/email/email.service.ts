import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma.service';
import { verificationOtpTemplate } from './templates/verification-otp.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { kycSubmittedTemplate } from './templates/kyc-submitted.template';
import { kycApprovedTemplate } from './templates/kyc-approved.template';
import { kycRejectedTemplate } from './templates/kyc-rejected.template';
import { invoiceReminderTemplate } from './templates/invoice-reminder.template';
import { invoiceOverdueTemplate } from './templates/invoice-overdue.template';
import { appointmentReminderTemplate } from './templates/appointment-reminder.template';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async sendOtp(userId: string): Promise<{
    message: string;
    expiresAt: Date;
    canResendAt?: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: { select: { firstName: true, lastName: true, otherName: true } },
        client: { select: { firstName: true, lastName: true, otherName: true } },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Check for active OTP (rate limiting)
    const activeOtp = await this.prisma.emailOtp.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (activeOtp) {
      const cooldownMinutes =
        this.configService.get<number>('OTP_RESEND_COOLDOWN_MINUTES') || 10;
      const canResendAt = new Date(
        activeOtp.createdAt.getTime() + cooldownMinutes * 60 * 1000,
      );

      if (new Date() < canResendAt) {
        const timeRemaining = Math.ceil(
          (canResendAt.getTime() - Date.now()) / 1000 / 60,
        );
        throw new BadRequestException(
          `An active OTP already exists. You can request a new one in ${timeRemaining} minute(s).`,
        );
      }
    }

    // Lazy cleanup: Delete expired OTPs for this user
    await this.cleanupExpiredOtps(userId);

    // Generate and store OTP
    const code = this.generateOtpCode();
    const expirationMinutes =
      this.configService.get<number>('OTP_EXPIRATION_MINUTES') || 10;
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.prisma.emailOtp.create({
      data: {
        userId,
        code,
        expiresAt,
      },
    });

    // Send email
    const userName = user.admin
      ? formatFullName(user.admin.firstName, user.admin.lastName, user.admin.otherName)
      : user.client
      ? formatFullName(user.client.firstName, user.client.lastName, user.client.otherName)
      : undefined;

    await this.sendEmail(
      user.email,
      'Verify Your Email - 1159 Realty',
      verificationOtpTemplate(code, userName),
    );

    this.logger.log(`OTP sent to user ${userId} (${user.email})`);

    return {
      message: 'OTP sent to your email',
      expiresAt,
    };
  }

  async verifyOtp(userId: string, code: string): Promise<boolean> {
    const otp = await this.prisma.emailOtp.findFirst({
      where: {
        userId,
        code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Get user details for welcome email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        admin: { select: { firstName: true, lastName: true, otherName: true } },
        client: { select: { firstName: true, lastName: true, otherName: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Mark user as verified
    await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailVerified: true },
    });

    // Delete all OTPs for this user
    await this.prisma.emailOtp.deleteMany({
      where: { userId },
    });

    this.logger.log(`Email verified for user ${userId}`);

    // Send welcome email
    const userName = user.admin
      ? formatFullName(user.admin.firstName, user.admin.lastName, user.admin.otherName)
      : user.client
      ? formatFullName(user.client.firstName, user.client.lastName, user.client.otherName)
      : 'there';

    const userType: 'client' | 'admin' = user.admin ? 'admin' : 'client';

    await this.sendWelcomeEmail(user.email, userName, userType);

    return true;
  }

  async resendOtp(userId: string): Promise<{
    message: string;
    expiresAt: Date;
    canResendAt: Date;
  }> {
    const result = await this.sendOtp(userId);

    const cooldownMinutes =
      this.configService.get<number>('OTP_RESEND_COOLDOWN_MINUTES') || 10;
    const canResendAt = new Date(Date.now() + cooldownMinutes * 60 * 1000);

    return {
      ...result,
      message: 'OTP resent to your email',
      canResendAt,
    };
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        admin: { select: { firstName: true, lastName: true, otherName: true } },
        client: { select: { firstName: true, lastName: true, otherName: true } },
      },
    });
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const resetUrl = this.configService.get<string>('PASSWORD_RESET_URL');
    const resetLink = `${resetUrl}?token=${token}`;

    const userName = user.admin
      ? formatFullName(user.admin.firstName, user.admin.lastName, user.admin.otherName)
      : user.client
      ? formatFullName(user.client.firstName, user.client.lastName, user.client.otherName)
      : undefined;

    await this.sendEmail(
      email,
      'Reset Your Password - 1159 Realty',
      passwordResetTemplate(resetLink, userName),
    );

    this.logger.log(`Password reset email sent to ${email}`);
  }

  async sendWelcomeEmail(
    email: string,
    userName: string,
    userType: 'client' | 'admin',
  ): Promise<void> {
    await this.sendEmail(
      email,
      'Welcome to 1159 Realty!',
      welcomeTemplate(userName, userType),
    );

    this.logger.log(`Welcome email sent to ${email} (${userType})`);
  }

  async sendKycSubmittedEmail(
    adminEmail: string,
    clientName: string,
    clientEmail: string,
    kycId: string,
  ): Promise<void> {
    await this.sendEmail(
      adminEmail,
      'New KYC Submission - 1159 Realty',
      kycSubmittedTemplate(clientName, clientEmail, kycId),
    );

    this.logger.log(
      `KYC submission notification sent to admin ${adminEmail} for client ${clientEmail}`,
    );
  }

  async sendKycApprovedEmail(
    clientEmail: string,
    clientName: string,
    feedback?: string,
  ): Promise<void> {
    await this.sendEmail(
      clientEmail,
      'KYC Verification Approved - 1159 Realty',
      kycApprovedTemplate(clientName, feedback),
    );

    this.logger.log(`KYC approval notification sent to client ${clientEmail}`);
  }

  async sendKycRejectedEmail(
    clientEmail: string,
    clientName: string,
    reason: string,
    feedback?: string,
  ): Promise<void> {
    await this.sendEmail(
      clientEmail,
      'KYC Verification Requires Attention - 1159 Realty',
      kycRejectedTemplate(clientName, reason, feedback),
    );

    this.logger.log(`KYC rejection notification sent to client ${clientEmail}`);
  }

  async sendInvoiceReminderEmail(
    recipientEmail: string,
    recipientName: string,
    propertyName: string,
    installmentNumber: number,
    amount: number,
    dueDate: Date,
    daysUntilDue: number,
  ): Promise<void> {
    await this.sendEmail(
      recipientEmail,
      'Payment Reminder - 1159 Realty',
      invoiceReminderTemplate(
        recipientName,
        propertyName,
        installmentNumber,
        amount,
        dueDate,
        daysUntilDue,
      ),
    );

    this.logger.log(
      `Invoice reminder sent to ${recipientEmail} for installment #${installmentNumber}`,
    );
  }

  async sendInvoiceOverdueEmail(
    recipientEmail: string,
    recipientName: string,
    propertyName: string,
    installmentNumber: number,
    amount: number,
    dueDate: Date,
    daysOverdue: number,
    gracePeriodRemaining: number,
  ): Promise<void> {
    await this.sendEmail(
      recipientEmail,
      'Overdue Payment Notice - 1159 Realty',
      invoiceOverdueTemplate(
        recipientName,
        propertyName,
        installmentNumber,
        amount,
        dueDate,
        daysOverdue,
        gracePeriodRemaining,
      ),
    );

    this.logger.log(
      `Overdue invoice notification sent to ${recipientEmail} for installment #${installmentNumber}`,
    );
  }

  async sendAppointmentReminderEmail(
    recipientEmail: string,
    recipientName: string,
    propertyName: string,
    appointmentDate: Date,
    location: string,
    message?: string,
  ): Promise<void> {
    await this.sendEmail(
      recipientEmail,
      'Appointment Reminder - 1159 Realty',
      appointmentReminderTemplate(
        recipientName,
        propertyName,
        appointmentDate,
        location,
        message,
      ),
    );

    this.logger.log(
      `Appointment reminder sent to ${recipientEmail} for ${appointmentDate.toISOString()}`,
    );
  }

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');
    const senderName = this.configService.get<string>('BREVO_SENDER_NAME');
    const replyTo = this.configService.get<string>('BREVO_DEFAULT_REPLY_TO');

    if (!apiKey) {
      this.logger.error('BREVO_API_KEY is not configured. Email not sent.');
      throw new Error('Email service is not configured properly');
    }

    this.logger.log(`Attempting to send email to ${to} with subject: "${subject}"`);

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          ...(replyTo && { replyTo: { email: replyTo } }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(
          `Brevo API error: ${response.status} - ${JSON.stringify(data)}`,
        );
        throw new Error(`Failed to send email: ${data.message || 'Unknown error'}`);
      }

      this.logger.log(`Email sent successfully to ${to} - Message ID: ${data.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }

  private async cleanupExpiredOtps(userId?: string): Promise<void> {
    const where = userId
      ? { userId, expiresAt: { lt: new Date() } }
      : { expiresAt: { lt: new Date() } };

    const result = await this.prisma.emailOtp.deleteMany({ where });

    if (result.count > 0) {
      this.logger.debug(`Cleaned up ${result.count} expired OTP(s)`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledOtpCleanup() {
    this.logger.log('Running scheduled OTP cleanup...');
    await this.cleanupExpiredOtps();
    this.logger.log('Scheduled OTP cleanup completed');
  }
}
