import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; appContext: string; description?: string }) {
    const existing = await this.prisma.role.findUnique({
      where: { name_appContext: { name: data.name, appContext: data.appContext } },
    });

    if (existing) {
      throw new ConflictException('Role with this name and appContext already exists');
    }

    return this.prisma.role.create({
      data,
    });
  }

  async findAll(query?: {
    search?: string;
    page?: string;
    limit?: string;
  }) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query?.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          roleResources: {
            include: {
              resource: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        roleResources: {
          include: {
            resource: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.role.delete({ where: { id } });

    return { message: 'Role deleted successfully' };
  }
}
