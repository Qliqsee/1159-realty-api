import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PermissionsCacheService } from './permissions-cache.service';

@Injectable()
export class PermissionsService {
  constructor(
    private prisma: PrismaService,
    private cacheService: PermissionsCacheService,
  ) {}

  // ========== RESOURCES CRUD ==========

  async createResource(data: { name: string; description?: string }) {
    const existing = await this.prisma.resource.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Resource with this name already exists');
    }

    const result = await this.prisma.resource.create({ data });
    this.cacheService.invalidateCache();
    return result;
  }

  async findAllResources(query?: { search?: string; page?: string; limit?: string }) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: any = query?.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [resources, total] = await Promise.all([
      this.prisma.resource.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.resource.count({ where }),
    ]);

    return {
      data: resources,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneResource(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: {
        roleResources: {
          include: {
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    return resource;
  }

  async updateResource(id: string, data: { name?: string; description?: string }) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    if (data.name && data.name !== resource.name) {
      const existing = await this.prisma.resource.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('Resource with this name already exists');
      }
    }

    const result = await this.prisma.resource.update({ where: { id }, data });
    this.cacheService.invalidateCache();
    return result;
  }

  async removeResource(id: string) {
    const resource = await this.prisma.resource.findUnique({ where: { id } });

    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    await this.prisma.resource.delete({ where: { id } });
    this.cacheService.invalidateCache();
    return { message: 'Resource deleted successfully' };
  }

  // ========== ACTIONS CRUD ==========

  async createAction(data: { name: string; description?: string }) {
    const existing = await this.prisma.action.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Action with this name already exists');
    }

    const result = await this.prisma.action.create({ data });
    this.cacheService.invalidateCache();
    return result;
  }

  async findAllActions(query?: { search?: string; page?: string; limit?: string }) {
    const page = query?.page ? parseInt(query.page, 10) : 1;
    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const skip = (page - 1) * limit;

    const where: any = query?.search
      ? { name: { contains: query.search, mode: 'insensitive' } }
      : {};

    const [actions, total] = await Promise.all([
      this.prisma.action.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.action.count({ where }),
    ]);

    return {
      data: actions,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneAction(id: string) {
    const action = await this.prisma.action.findUnique({ where: { id } });

    if (!action) {
      throw new NotFoundException('Action not found');
    }

    return action;
  }

  async updateAction(id: string, data: { name?: string; description?: string }) {
    const action = await this.prisma.action.findUnique({ where: { id } });

    if (!action) {
      throw new NotFoundException('Action not found');
    }

    if (data.name && data.name !== action.name) {
      const existing = await this.prisma.action.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('Action with this name already exists');
      }
    }

    const result = await this.prisma.action.update({ where: { id }, data });
    this.cacheService.invalidateCache();
    return result;
  }

  async removeAction(id: string) {
    const action = await this.prisma.action.findUnique({ where: { id } });

    if (!action) {
      throw new NotFoundException('Action not found');
    }

    await this.prisma.action.delete({ where: { id } });
    this.cacheService.invalidateCache();
    return { message: 'Action deleted successfully' };
  }

  // ========== ROLE-RESOURCE MANAGEMENT ==========

  async attachResourceToRole(roleId: string, resourceId: string, actions: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    const resource = await this.prisma.resource.findUnique({ where: { id: resourceId } });

    if (!role) throw new NotFoundException('Role not found');
    if (!resource) throw new NotFoundException('Resource not found');
    if (!actions || actions.length === 0) {
      throw new ConflictException('At least one action must be provided');
    }

    // Validate all actions exist in Actions table
    const validActions = await this.prisma.action.findMany({
      where: { name: { in: actions } }
    });

    const validActionNames = validActions.map(a => a.name);
    const invalidActions = actions.filter(a => !validActionNames.includes(a));

    if (invalidActions.length > 0) {
      throw new ConflictException(
        `Invalid actions: ${invalidActions.join(', ')}. Actions must exist in the actions table.`
      );
    }

    const existing = await this.prisma.roleResource.findUnique({
      where: { roleId_resourceId: { roleId, resourceId } },
    });

    if (existing) {
      const result = await this.prisma.roleResource.update({
        where: { roleId_resourceId: { roleId, resourceId } },
        data: { actions },
        include: { resource: true, role: { select: { name: true } } },
      });
      this.cacheService.invalidateCache();
      return result;
    }

    const result = await this.prisma.roleResource.create({
      data: { roleId, resourceId, actions },
      include: { resource: true, role: { select: { name: true } } },
    });
    this.cacheService.invalidateCache();
    return result;
  }

  async detachResourceFromRole(roleId: string, resourceId: string) {
    const roleResource = await this.prisma.roleResource.findUnique({
      where: { roleId_resourceId: { roleId, resourceId } },
    });

    if (!roleResource) {
      throw new NotFoundException('Role does not have this resource attached');
    }

    await this.prisma.roleResource.delete({
      where: { roleId_resourceId: { roleId, resourceId } },
    });

    this.cacheService.invalidateCache();
    return { message: 'Resource detached from role successfully' };
  }

  // ========== GET ALL PERMISSIONS ENDPOINT ==========

  async getAllPermissions() {
    return this.cacheService.getPermissions();
  }

  // ========== PERMISSION CHECKING UTILITY ==========

  async checkPermission(roleNames: string[], resource: string, action: string): Promise<boolean> {
    return this.cacheService.checkPermission(roleNames, resource, action);
  }
}
