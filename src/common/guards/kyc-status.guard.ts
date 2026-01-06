import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { KycStatus } from '@prisma/client';

export const RequireKycStatus = (...statuses: KycStatus[]) =>
  SetMetadata('kycStatuses', statuses);

@Injectable()
export class KycStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredStatuses = this.reflector.get<KycStatus[]>(
      'kycStatuses',
      context.getHandler(),
    );

    if (!requiredStatuses || requiredStatuses.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { userId },
      select: { status: true },
    });

    if (!kyc) {
      throw new ForbiddenException('KYC not found');
    }

    if (!requiredStatuses.includes(kyc.status)) {
      throw new ForbiddenException(
        `KYC status must be one of: ${requiredStatuses.join(', ')}`,
      );
    }

    return true;
  }
}
