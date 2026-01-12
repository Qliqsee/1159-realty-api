import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AddExceptionDto } from './dto/add-exception.dto';
import { ConfigResponseDto, ExceptionUserDto } from './dto/config-response.dto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class DisbursementConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig(): Promise<ConfigResponseDto> {
    const config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      // Create default config if none exists
      const defaultConfig = await this.prisma.disbursementConfig.create({
        data: {
          mode: 'NONE_EXCEPT',
          exceptionUserIds: [],
        },
      });
      return this.formatConfigResponse(defaultConfig);
    }

    return this.formatConfigResponse(config);
  }

  async updateConfig(updateDto: UpdateConfigDto): Promise<ConfigResponseDto> {
    const { mode } = updateDto;

    // Get current config or create if none exists
    let config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      config = await this.prisma.disbursementConfig.create({
        data: {
          mode,
          exceptionUserIds: [],
        },
      });
    } else {
      config = await this.prisma.disbursementConfig.update({
        where: { id: config.id },
        data: { mode },
      });
    }

    return this.formatConfigResponse(config);
  }

  async addException(addExceptionDto: AddExceptionDto): Promise<ConfigResponseDto> {
    const { userId } = addExceptionDto;

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get current config or create if none exists
    let config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      config = await this.prisma.disbursementConfig.create({
        data: {
          mode: 'NONE_EXCEPT',
          exceptionUserIds: [userId],
        },
      });
    } else {
      // Check if user is already in exception list
      if (config.exceptionUserIds.includes(userId)) {
        throw new BadRequestException('User already in exception list');
      }

      config = await this.prisma.disbursementConfig.update({
        where: { id: config.id },
        data: {
          exceptionUserIds: {
            push: userId,
          },
        },
      });
    }

    return this.formatConfigResponse(config);
  }

  async removeException(userId: string): Promise<ConfigResponseDto> {
    const config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    if (!config.exceptionUserIds.includes(userId)) {
      throw new BadRequestException('User not in exception list');
    }

    const updatedConfig = await this.prisma.disbursementConfig.update({
      where: { id: config.id },
      data: {
        exceptionUserIds: config.exceptionUserIds.filter((id) => id !== userId),
      },
    });

    return this.formatConfigResponse(updatedConfig);
  }

  async listExceptions(search?: string): Promise<ExceptionUserDto[]> {
    const config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config || config.exceptionUserIds.length === 0) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: config.exceptionUserIds },
        ...(search && {
          email: { contains: search, mode: 'insensitive' },
        }),
      },
      select: {
        id: true,
        email: true,
        admin: {
          select: {
            firstName: true,
            lastName: true,
            otherName: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
            otherName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      name: user.admin
        ? formatFullName(user.admin.firstName, user.admin.lastName, user.admin.otherName)
        : user.client
        ? formatFullName(user.client.firstName, user.client.lastName, user.client.otherName)
        : 'Unknown',
      email: user.email,
      addedAt: config.createdAt, // Simplified: using config creation date
    }));
  }

  async shouldAutoDisburseTUser(userId: string): Promise<boolean> {
    const config = await this.prisma.disbursementConfig.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!config) {
      return false; // Default: no auto-disbursement
    }

    const isInExceptionList = config.exceptionUserIds.includes(userId);

    if (config.mode === 'ALL_EXCEPT') {
      // Auto-disburse to all EXCEPT those in the exception list
      return !isInExceptionList;
    } else {
      // Auto-disburse to NONE EXCEPT those in the exception list
      return isInExceptionList;
    }
  }

  private formatConfigResponse(config: any): ConfigResponseDto {
    return {
      id: config.id,
      mode: config.mode,
      exceptionUserIds: config.exceptionUserIds,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };
  }
}
