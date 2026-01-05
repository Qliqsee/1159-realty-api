import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; appContext: string; description?: string }) {
    const existing = await this.prisma.role.findUnique({
      where: {
        name_appContext: {
          name: data.name,
          appContext: data.appContext,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Role with this name and context already exists');
    }

    return this.prisma.role.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: string, data: { name?: string; appContext?: string; description?: string }) {
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

  async assignPermission(roleId: string, permissionId: string) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Role already has this permission');
    }

    return this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        permission: true,
      },
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('Role does not have this permission');
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return { message: 'Permission removed from role successfully' };
  }

  async createPermission(data: { name: string; resource: string; action: string; description?: string }) {
    const existing = await this.prisma.permission.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Permission with this name already exists');
    }

    return this.prisma.permission.create({
      data,
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany();
  }
}
