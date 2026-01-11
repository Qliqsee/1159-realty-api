import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { KycStatus } from '@prisma/client';

@Injectable()
export class KycCompletionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.clientId) {
      throw new ForbiddenException('User not authenticated or not a client');
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { clientId: user.clientId },
    });

    if (!kyc) {
      throw new ForbiddenException(
        'KYC not found. Please complete your KYC verification to access this feature.',
      );
    }

    if (kyc.status !== KycStatus.APPROVED) {
      throw new ForbiddenException(
        'KYC verification required. Please complete and submit your KYC for approval to access this feature.',
      );
    }

    return true;
  }
}
