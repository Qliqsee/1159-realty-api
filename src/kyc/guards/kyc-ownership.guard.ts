import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class KycOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const kycId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!kycId) {
      // If no KYC ID in params, allow (might be creating new KYC)
      return true;
    }

    const kyc = await this.prisma.kyc.findUnique({
      where: { id: kycId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC not found');
    }

    if (kyc.userId !== userId) {
      throw new ForbiddenException('You can only access your own KYC');
    }

    return true;
  }
}
