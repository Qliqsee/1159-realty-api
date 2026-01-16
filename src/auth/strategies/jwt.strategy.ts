import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Lightweight query - only fetch what's needed (no roles query)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isBanned: true,
        isSuspended: true,
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new ForbiddenException('Your account has been banned');
    }

    // Use roles from JWT payload - no DB query needed
    const roles = (payload.roles || []).map((roleName: string) => ({ name: roleName }));

    // Return user info with roles from token
    // Include adminId and clientId from JWT payload (if available) for backward compatibility with old tokens
    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      userType: payload.userType,
      admin: user.admin || null,
      client: user.client || null,
      adminId: payload.adminId || user.admin?.id || null, // Use from JWT or fallback to DB query
      clientId: payload.clientId || user.client?.id || null, // Use from JWT or fallback to DB query
      roles,
    };
  }
}
