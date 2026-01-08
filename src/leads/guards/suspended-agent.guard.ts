import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SuspendedAgentGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('User not authenticated');
    }

    const userData = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { isSuspended: true },
    });

    if (userData?.isSuspended) {
      throw new ForbiddenException(
        'Suspended agents cannot perform lead operations',
      );
    }

    return true;
  }
}
