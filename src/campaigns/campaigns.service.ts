import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BrevoService } from './brevo.service';
import { CreateSegmentDto } from './dto/create-segment.dto';
import { UpdateSegmentDto } from './dto/update-segment.dto';
import { SegmentListQueryDto } from './dto/segment-list-query.dto';
import { SegmentResponseDto } from './dto/segment-response.dto';
import { PaginatedSegmentResponseDto } from './dto/paginated-segment-response.dto';
import { SegmentPreviewQueryDto } from './dto/segment-preview-query.dto';
import { SegmentPreviewResponseDto } from './dto/segment-preview-response.dto';
import { SyncSegmentResponseDto } from './dto/sync-segment-response.dto';
import { SegmentStatsDto } from './dto/segment-stats.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private prisma: PrismaService,
    private brevoService: BrevoService,
  ) {}

  async createSegment(
    createSegmentDto: CreateSegmentDto,
    userId: string,
  ): Promise<SegmentResponseDto> {
    const {
      name,
      description,
      gender = [],
      properties = [],
      countries = [],
      states = [],
      trafficSources = [],
      agentIds = [],
      partnerIds = [],
    } = createSegmentDto;

    // Validate at least one criteria is provided
    if (
      !gender.length &&
      !properties.length &&
      !countries.length &&
      !states.length &&
      !trafficSources.length &&
      !agentIds.length &&
      !partnerIds.length
    ) {
      throw new BadRequestException(
        'At least one filter criteria must be provided',
      );
    }

    // Validate property IDs exist
    if (properties.length > 0) {
      const validProperties = await this.prisma.property.count({
        where: { id: { in: properties } },
      });
      if (validProperties !== properties.length) {
        throw new BadRequestException('One or more property IDs are invalid');
      }
    }

    // Validate agent IDs exist
    if (agentIds.length > 0) {
      const validAgents = await this.prisma.user.count({
        where: {
          id: { in: agentIds },
          userRoles: {
            some: {
              role: {
                name: 'agent',
              },
            },
          },
        },
      });
      if (validAgents !== agentIds.length) {
        throw new BadRequestException('One or more agent IDs are invalid');
      }
    }

    // Validate partner IDs exist
    if (partnerIds.length > 0) {
      const validPartners = await this.prisma.client.count({
        where: {
          id: { in: partnerIds },
          partnership: {
            status: 'APPROVED',
          },
        },
      });
      if (validPartners !== partnerIds.length) {
        throw new BadRequestException('One or more partner IDs are invalid');
      }
    }

    let brevoListId: string | null = null;

    try {
      // Create Brevo list
      brevoListId = await this.brevoService.createList(name, description);
    } catch (error) {
      this.logger.error(`Failed to create Brevo list: ${error.message}`);
      throw new HttpException(
        'Failed to create segment in Brevo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      // Create segment in database
      const segment = await this.prisma.segment.create({
        data: {
          name,
          description,
          gender,
          properties,
          countries,
          states,
          trafficSources,
          agentIds,
          partnerIds,
          brevoListId,
          createdBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
      });

      return this.mapSegmentToResponse(segment);
    } catch (error) {
      // Rollback Brevo list if database creation fails
      if (brevoListId) {
        try {
          await this.brevoService.deleteList(brevoListId);
        } catch (deleteError) {
          this.logger.error(
            `Failed to rollback Brevo list: ${deleteError.message}`,
          );
        }
      }
      throw error;
    }
  }

  async findAllSegments(
    query: SegmentListQueryDto,
  ): Promise<PaginatedSegmentResponseDto> {
    const { search, page = 1, limit = 10, createdBy } = query;

    const where: Prisma.SegmentWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (createdBy) {
      where.createdBy = createdBy;
    }

    const [segments, total] = await Promise.all([
      this.prisma.segment.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.segment.count({ where }),
    ]);

    return {
      data: segments.map((segment) => this.mapSegmentToResponse(segment)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findSegmentById(id: string): Promise<SegmentResponseDto> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    return this.mapSegmentToResponse(segment);
  }

  async updateSegment(
    id: string,
    updateSegmentDto: UpdateSegmentDto,
  ): Promise<SegmentResponseDto> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    const {
      name,
      description,
      gender,
      properties,
      countries,
      states,
      trafficSources,
      agentIds,
      partnerIds,
    } = updateSegmentDto;

    // Validate property IDs if provided
    if (properties && properties.length > 0) {
      const validProperties = await this.prisma.property.count({
        where: { id: { in: properties } },
      });
      if (validProperties !== properties.length) {
        throw new BadRequestException('One or more property IDs are invalid');
      }
    }

    // Validate agent IDs if provided
    if (agentIds && agentIds.length > 0) {
      const validAgents = await this.prisma.user.count({
        where: {
          id: { in: agentIds },
          userRoles: {
            some: {
              role: {
                name: 'agent',
              },
            },
          },
        },
      });
      if (validAgents !== agentIds.length) {
        throw new BadRequestException('One or more agent IDs are invalid');
      }
    }

    // Validate partner IDs if provided
    if (partnerIds && partnerIds.length > 0) {
      const validPartners = await this.prisma.client.count({
        where: {
          id: { in: partnerIds },
          partnership: {
            status: 'APPROVED',
          },
        },
      });
      if (validPartners !== partnerIds.length) {
        throw new BadRequestException('One or more partner IDs are invalid');
      }
    }

    // Update Brevo list if name changed
    if (name && segment.brevoListId) {
      try {
        await this.brevoService.updateList(
          segment.brevoListId,
          name,
          description,
        );
      } catch (error) {
        this.logger.error(`Failed to update Brevo list: ${error.message}`);
        throw new HttpException(
          'Failed to update segment in Brevo',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const updatedSegment = await this.prisma.segment.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(gender && { gender }),
        ...(properties && { properties }),
        ...(countries && { countries }),
        ...(states && { states }),
        ...(trafficSources && { trafficSources }),
        ...(agentIds && { agentIds }),
        ...(partnerIds && { partnerIds }),
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return this.mapSegmentToResponse(updatedSegment);
  }

  async deleteSegment(id: string): Promise<void> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    // Delete from Brevo
    if (segment.brevoListId) {
      try {
        await this.brevoService.deleteList(segment.brevoListId);
      } catch (error) {
        this.logger.error(`Failed to delete Brevo list: ${error.message}`);
        // Continue with database deletion even if Brevo deletion fails
      }
    }

    // Delete from database
    await this.prisma.segment.delete({
      where: { id },
    });
  }

  async previewSegment(
    id: string,
    query: SegmentPreviewQueryDto,
  ): Promise<SegmentPreviewResponseDto> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    const { page = 1, limit = 10 } = query;

    const where = this.buildSegmentQuery(segment);

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          gender: true,
          country: true,
          state: true,
          referralSource: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients.map((client) => ({
        id: client.id,
        name: client.name || '',
        email: client.user?.email || '',
        phone: client.phone || '',
        gender: client.gender || '',
        country: client.country || '',
        state: client.state || '',
        referralSource: client.referralSource,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async syncSegmentToBrevo(
    id: string,
    userId: string,
  ): Promise<SyncSegmentResponseDto> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    if (!segment.brevoListId) {
      throw new BadRequestException('Segment is not linked to a Brevo list');
    }

    const where = this.buildSegmentQuery(segment);

    // Get all matching clients
    const clients = await this.prisma.client.findMany({
      where,
      select: {
        name: true,
        phone: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    let syncedCount = 0;
    let status = 'SUCCESS';
    let errorMessage: string | null = null;

    try {
      // Format contacts for Brevo
      const contacts = clients.map((client) =>
        this.brevoService.formatContactForBrevo({
          email: client.user?.email || '',
          name: client.name,
          phone: client.phone,
        }),
      );

      // Sync to Brevo
      syncedCount = await this.brevoService.syncContactsToList(
        segment.brevoListId,
        contacts,
      );
    } catch (error) {
      status = 'FAILED';
      errorMessage = error.message;
      this.logger.error(`Segment sync failed: ${error.message}`);
    }

    // Record export in database
    await this.prisma.segmentExport.create({
      data: {
        segmentId: id,
        usersCount: syncedCount,
        exportedBy: userId,
        status,
        errorMessage,
      },
    });

    if (status === 'FAILED') {
      throw new HttpException(
        errorMessage || 'Failed to sync segment to Brevo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      segmentId: id,
      segmentName: segment.name,
      brevoListId: segment.brevoListId,
      usersSynced: syncedCount,
      status,
      syncedAt: new Date(),
      message: 'Synced successfully to Brevo',
    };
  }

  async getSegmentStats(): Promise<SegmentStatsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSegments,
      totalSyncs,
      segmentsThisMonth,
      syncsThisMonth,
    ] = await Promise.all([
      this.prisma.segment.count(),
      this.prisma.segmentExport.count(),
      this.prisma.segment.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      this.prisma.segmentExport.count({
        where: {
          exportedAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    return {
      totalSegments,
      totalSyncs,
      segmentsThisMonth,
      syncsThisMonth,
    };
  }

  private buildSegmentQuery(segment: any): Prisma.ClientWhereInput {
    const conditions: Prisma.ClientWhereInput[] = [];

    // Filter by gender
    if (segment.gender && segment.gender.length > 0) {
      conditions.push({
        gender: {
          in: segment.gender,
        },
      });
    }

    // Filter by properties (users enrolled in these properties)
    if (segment.properties && segment.properties.length > 0) {
      conditions.push({
        enrollmentsAsClient: {
          some: {
            propertyId: {
              in: segment.properties,
            },
          },
        },
      });
    }

    // Filter by countries
    if (segment.countries && segment.countries.length > 0) {
      conditions.push({
        country: {
          in: segment.countries,
        },
      });
    }

    // Filter by states
    if (segment.states && segment.states.length > 0) {
      conditions.push({
        state: {
          in: segment.states,
        },
      });
    }

    // Filter by traffic sources
    if (segment.trafficSources && segment.trafficSources.length > 0) {
      conditions.push({
        referralSource: {
          in: segment.trafficSources,
        },
      });
    }

    // Filter by agents (users who have enrollments with these agents or leads closed by these agents)
    if (segment.agentIds && segment.agentIds.length > 0) {
      conditions.push({
        OR: [
          {
            enrollmentsAsClient: {
              some: {
                agentId: {
                  in: segment.agentIds,
                },
              },
            },
          },
          {
            closedBy: {
              in: segment.agentIds,
            },
          },
        ],
      });
    }

    // Filter by partners
    if (segment.partnerIds && segment.partnerIds.length > 0) {
      conditions.push({
        referredByPartnerId: {
          in: segment.partnerIds,
        },
      });
    }

    // Combine all conditions with AND logic
    if (conditions.length === 0) {
      return {};
    }

    return {
      AND: conditions,
    };
  }

  private mapSegmentToResponse(segment: any): SegmentResponseDto {
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      gender: segment.gender,
      properties: segment.properties,
      countries: segment.countries,
      states: segment.states,
      trafficSources: segment.trafficSources,
      agentIds: segment.agentIds,
      partnerIds: segment.partnerIds,
      brevoListId: segment.brevoListId,
      creator: {
        id: segment.creator.id,
        name: segment.creator.name || '',
        email: segment.creator.user?.email || '',
      },
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }
}
