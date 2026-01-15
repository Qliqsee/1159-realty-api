import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PermissionsCacheService implements OnModuleInit {
  private permissionsCache: Record<string, Record<string, string[]>> | null = null;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.loadCache();
  }

  async loadCache(): Promise<void> {
    const roleResources = await this.prisma.roleResource.findMany({
      include: {
        role: { select: { name: true } },
        resource: { select: { name: true } },
      },
    });

    const permissions: Record<string, Record<string, string[]>> = {};

    for (const rr of roleResources) {
      if (!permissions[rr.role.name]) {
        permissions[rr.role.name] = {};
      }
      permissions[rr.role.name][rr.resource.name] = rr.actions;
    }

    this.permissionsCache = permissions;
  }

  invalidateCache(): void {
    this.permissionsCache = null;
  }

  async getPermissions(): Promise<Record<string, Record<string, string[]>>> {
    if (!this.permissionsCache) {
      await this.loadCache();
    }
    return this.permissionsCache!;
  }

  async checkPermission(
    roleNames: string[],
    resource: string,
    action: string,
  ): Promise<boolean> {
    const permissions = await this.getPermissions();

    for (const roleName of roleNames) {
      const rolePerms = permissions[roleName];
      if (rolePerms && rolePerms[resource]) {
        // Check if role has the exact action
        if (rolePerms[resource].includes(action)) {
          return true;
        }
        // Check if role has "manage" action - which grants ALL actions for this resource
        if (rolePerms[resource].includes('manage')) {
          return true;
        }
      }
    }

    return false;
  }
}
