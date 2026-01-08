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
import { kycSubmittedTemplate } from './templates/kyc-submitted.template';
import { kycApprovedTemplate } from './templates/kyc-approved.template';
import { kycRejectedTemplate } from './templates/kyc-rejected.template';

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
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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
    await this.sendEmail(
      user.email,
      'Verify Your Email - 1159 Realty',
      verificationOtpTemplate(code, user.name || undefined),
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
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const resetUrl = this.configService.get<string>('PASSWORD_RESET_URL');
    const resetLink = `${resetUrl}?token=${token}`;

    await this.sendEmail(
      email,
      'Reset Your Password - 1159 Realty',
      passwordResetTemplate(resetLink, user.name || undefined),
    );

    this.logger.log(`Password reset email sent to ${email}`);
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

  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    // Mocked Brevo integration
    // In production, replace with actual Brevo API call
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');
    const senderName = this.configService.get<string>('BREVO_SENDER_NAME');

    this.logger.debug(
      `[MOCKED] Sending email to ${to} with subject: ${subject}`,
    );
    this.logger.debug(`[MOCKED] Sender: ${senderName} <${senderEmail}>`);
    this.logger.debug(`[MOCKED] API Key configured: ${!!apiKey}`);

    // TODO: Replace with actual Brevo API integration
    // Example:
    // const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    //   method: 'POST',
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //     'api-key': apiKey,
    //   },
    //   body: JSON.stringify({
    //     sender: { name: senderName, email: senderEmail },
    //     to: [{ email: to }],
    //     subject,
    //     htmlContent: html,
    //   }),
    // });
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
