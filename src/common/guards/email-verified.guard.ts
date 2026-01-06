import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User not authenticated');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isEmailVerified: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException(
        'Email verification required. Please verify your email before accessing this resource.',
      );
    }

    return true;
  }
}
