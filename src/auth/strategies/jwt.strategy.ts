import { Injectable, UnauthorizedException } from '@nestjs/common';
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
      roles,
      permissions,
    };
  }
}
