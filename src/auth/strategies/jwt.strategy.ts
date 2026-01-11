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
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        admin: true,
        client: true,
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
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

    const userType = user.admin ? 'admin' : user.client ? 'client' : null;

    if (!userType) {
      throw new UnauthorizedException('User type not found');
    }

    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      appContext: ur.role.appContext,
    }));

    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => ({
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
      })),
    );

    return {
      userId: user.id,
      email: user.email,
      userType,
      admin: user.admin || null,
      client: user.client || null,
      roles,
      permissions,
    };
  }
}
