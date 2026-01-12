import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CapabilitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get capabilities for a user based on their roles and permissions
   */
  async getUserCapabilities(userId: string): Promise<string[]> {
    // Get user's roles
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: {
                  include: {
                    permissionCapabilities: {
                      include: {
                        capability: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Extract unique capabilities
    const capabilitiesSet = new Set<string>();

    for (const userRole of userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        for (const permissionCapability of rolePermission.permission.permissionCapabilities) {
          capabilitiesSet.add(permissionCapability.capability.name);
        }
      }
    }

    return Array.from(capabilitiesSet).sort();
  }

  /**
   * Get all capabilities with their descriptions
   */
  async getAllCapabilities() {
    return this.prisma.capability.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get capability details including which permissions map to it
   */
  async getCapabilityDetails(capabilityName: string) {
    return this.prisma.capability.findUnique({
      where: { name: capabilityName },
      include: {
        permissionCapabilities: {
          include: {
            permission: true,
          },
        },
      },
    });
  }
}
