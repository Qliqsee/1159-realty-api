import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class MaxLeadReservationGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      return false;
    }

    // Check if user has Head of Sales role
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId: user.id },
      include: {
        role: true,
      },
    });

    const isHoS = userRoles.some(
      (ur) =>
        ur.role.name.toLowerCase() === 'head of sales' ||
        ur.role.name.toLowerCase() === 'hos' ||
        ur.role.name.toLowerCase() === 'admin',
    );

    // HoS can assign unlimited leads
    if (isHoS) {
      return true;
    }

    // Count reserved leads for agent
    const reservedCount = await this.prisma.lead.count({
      where: {
        reservedBy: user.id,
        status: LeadStatus.RESERVED,
        reservationExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (reservedCount >= 3) {
      throw new BadRequestException(
        'Maximum 3 leads can be reserved at a time. Please contact Head of Sales for additional assignments.',
      );
    }

    return true;
  }
}
