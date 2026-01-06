import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async requestReset(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const { token, hashedToken } = await this.generateResetToken();

    // Store hashed token with expiration
    const expirationHours =
      this.configService.get<number>('PASSWORD_RESET_TOKEN_EXPIRATION_HOURS') || 1;
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    // Clean up old tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: hashedToken,
        expiresAt,
      },
    });

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(email, token);

    this.logger.log(`Password reset token generated for user ${user.id}`);

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async verifyToken(token: string): Promise<{ valid: boolean; userId?: string }> {
    const hashedToken = await bcrypt.hash(token, 6);

    // Find all active tokens and check against them
    const activeTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        expiresAt: { gt: new Date() },
        isUsed: false,
      },
    });

    for (const tokenRecord of activeTokens) {
      const isMatch = await bcrypt.compare(token, tokenRecord.token);
      if (isMatch) {
        return { valid: true, userId: tokenRecord.userId };
      }
    }

    return { valid: false };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Verify token
    const { valid, userId } = await this.verifyToken(token);

    if (!valid || !userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    const activeTokens = await this.prisma.passwordResetToken.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        isUsed: false,
      },
    });

    for (const tokenRecord of activeTokens) {
      const isMatch = await bcrypt.compare(token, tokenRecord.token);
      if (isMatch) {
        await this.prisma.passwordResetToken.update({
          where: { id: tokenRecord.id },
          data: { isUsed: true },
        });
        break;
      }
    }

    this.logger.log(`Password reset successful for user ${userId}`);

    return { message: 'Password reset successfully' };
  }

  private async generateResetToken(): Promise<{ token: string; hashedToken: string }> {
    const token = randomUUID();
    const hashedToken = await bcrypt.hash(token, 6);
    return { token, hashedToken };
  }
}
