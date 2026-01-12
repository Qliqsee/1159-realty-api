import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { CapabilitiesService } from '../capabilities/capabilities.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from './dto/signup.dto';
import { AdminSignUpDto } from './dto/admin-signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private capabilitiesService: CapabilitiesService,
  ) {}

  // CLIENT SIGNUP
  async signUp(signUpDto: SignUpDto) {
    const { email, password, name, partnerRefCode } = signUpDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    // Validate partner referral code if provided
    let referredByPartnerId: string | undefined;
    if (partnerRefCode) {
      const referringPartner = await this.prisma.client.findFirst({
        where: {
          partnerLink: partnerRefCode,
          partnership: {
            status: 'APPROVED',
            suspendedAt: null,
          },
        },
      });

      if (referringPartner) {
        referredByPartnerId = referringPartner.id;
      }
    }

    // Create user and client in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const client = await tx.client.create({
        data: {
          userId: user.id,
          name,
          referredByPartnerId,
        },
      });

      // Assign client role
      const clientRole = await tx.role.findUnique({
        where: { name: 'client' },
        select: { id: true },
      });

      if (clientRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: clientRole.id,
          },
        });
      }

      return { user, client };
    });

    // Fetch user roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: result.user.id },
      select: {
        userRoles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });
    const roles = userWithRoles?.userRoles.map(ur => ur.role.name) || [];

    const tokens = await this.generateTokens(result.user.id, result.user.email, 'client', roles);
    const capabilities = await this.capabilitiesService.getUserCapabilities(result.user.id);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.client.name,
      },
      capabilities,
      ...tokens,
    };
  }

  // ADMIN SIGNUP
  async adminSignUp(adminSignUpDto: AdminSignUpDto) {
    const { email, password } = adminSignUpDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    // Create user and admin in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const admin = await tx.admin.create({
        data: {
          userId: user.id,
        },
      });

      // Assign agent role by default
      const agentRole = await tx.role.findUnique({
        where: { name: 'agent' },
        select: { id: true },
      });

      if (agentRole) {
        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: agentRole.id,
          },
        });
      }

      return { user, admin };
    });

    // Fetch user roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: result.user.id },
      select: {
        userRoles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });
    const roles = userWithRoles?.userRoles.map(ur => ur.role.name) || [];

    const tokens = await this.generateTokens(result.user.id, result.user.email, 'admin', roles);
    const capabilities = await this.capabilitiesService.getUserCapabilities(result.user.id);

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.admin.name,
      },
      capabilities,
      ...tokens,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        isBanned: true,
        admin: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return null;
    }

    // Check if user is banned
    if (user.isBanned) {
      throw new ForbiddenException('Your account has been banned');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(user: any) {
    // Determine userType
    const userType = user.admin ? 'admin' : user.client ? 'client' : null;
    const name = user.admin?.name || user.client?.name || null;

    if (!userType) {
      throw new UnauthorizedException('User type not found');
    }

    // Fetch user roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        userRoles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });
    const roles = userWithRoles?.userRoles.map(ur => ur.role.name) || [];

    const tokens = await this.generateTokens(user.id, user.email, userType, roles);
    const capabilities = await this.capabilitiesService.getUserCapabilities(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name,
        userType,
      },
      capabilities,
      ...tokens,
    };
  }

  // CLIENT GOOGLE OAUTH
  async validateGoogleUser(profile: { googleId: string; email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
      select: {
        id: true,
        email: true,
        isBanned: true,
        client: { select: { id: true, name: true } },
        admin: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
        select: {
          id: true,
          email: true,
          isBanned: true,
          client: { select: { id: true, name: true } },
          admin: { select: { id: true, name: true } },
        },
      });

      if (user) {
        // Link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId },
          select: {
            id: true,
            email: true,
            isBanned: true,
            client: { select: { id: true, name: true } },
            admin: { select: { id: true, name: true } },
          },
        });
      } else {
        // Create new client user with Google
        const result = await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              googleId: profile.googleId,
              email: profile.email,
              isEmailVerified: true,
            },
          });

          const client = await tx.client.create({
            data: {
              userId: newUser.id,
              name: profile.name,
            },
          });

          // Assign client role
          const clientRole = await tx.role.findUnique({
            where: { name: 'client' },
            select: { id: true },
          });

          if (clientRole) {
            await tx.userRole.create({
              data: {
                userId: newUser.id,
                roleId: clientRole.id,
              },
            });
          }

          return tx.user.findUnique({
            where: { id: newUser.id },
            select: {
              id: true,
              email: true,
              isBanned: true,
              client: { select: { id: true, name: true } },
              admin: { select: { id: true, name: true } },
            },
          });
        });

        user = result;
      }
    }

    return user;
  }

  // ADMIN GOOGLE OAUTH
  async validateGoogleAdminUser(profile: { googleId: string; email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
      select: {
        id: true,
        email: true,
        isBanned: true,
        admin: { select: { id: true, name: true } },
        client: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
        select: {
          id: true,
          email: true,
          isBanned: true,
          admin: { select: { id: true, name: true } },
          client: { select: { id: true, name: true } },
        },
      });

      if (user) {
        // Link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId },
          select: {
            id: true,
            email: true,
            isBanned: true,
            admin: { select: { id: true, name: true } },
            client: { select: { id: true, name: true } },
          },
        });
      } else {
        // Create new admin user with Google
        const result = await this.prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              googleId: profile.googleId,
              email: profile.email,
              isEmailVerified: true,
            },
          });

          const admin = await tx.admin.create({
            data: {
              userId: newUser.id,
              name: profile.name,
            },
          });

          // Assign agent role
          const agentRole = await tx.role.findUnique({
            where: { name: 'agent' },
            select: { id: true },
          });

          if (agentRole) {
            await tx.userRole.create({
              data: {
                userId: newUser.id,
                roleId: agentRole.id,
              },
            });
          }

          return tx.user.findUnique({
            where: { id: newUser.id },
            select: {
              id: true,
              email: true,
              isBanned: true,
              admin: { select: { id: true, name: true } },
              client: { select: { id: true, name: true } },
            },
          });
        });

        user = result;
      }
    }

    return user;
  }

  async googleLogin(user: any) {
    // Check if user is banned
    if (user.isBanned) {
      throw new ForbiddenException('Your account has been banned');
    }

    // Determine userType
    const userType = user.admin ? 'admin' : user.client ? 'client' : null;
    const name = user.admin?.name || user.client?.name || null;

    if (!userType) {
      throw new UnauthorizedException('User type not found');
    }

    // Fetch user roles
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        userRoles: {
          select: {
            role: {
              select: { name: true },
            },
          },
        },
      },
    });
    const roles = userWithRoles?.userRoles.map(ur => ur.role.name) || [];

    const tokens = await this.generateTokens(user.id, user.email, userType, roles);
    const capabilities = await this.capabilitiesService.getUserCapabilities(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name,
        userType,
      },
      capabilities,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          isBanned: true,
          admin: { select: { id: true } },
          client: { select: { id: true } },
          userRoles: {
            select: {
              role: {
                select: { name: true },
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

      // Fetch fresh roles from DB
      const roles = user.userRoles.map(ur => ur.role.name);

      const tokens = await this.generateTokens(user.id, user.email, userType, roles);
      return tokens;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(userId: string, email: string, userType: 'admin' | 'client', roles: string[]) {
    const payload = {
      sub: userId,
      email,
      userType,
      roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION') as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
