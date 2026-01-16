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
import { BrevoContactsQueryDto } from './dto/brevo-contacts-query.dto';
import { BrevoContactsResponseDto } from './dto/brevo-contact-response.dto';
import { Prisma } from '@prisma/client';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private prisma: PrismaService,
    private brevoService: BrevoService,
  ) {}

  async createSegment(
    createSegmentDto: CreateSegmentDto,
    adminId: string,
  ): Promise<SegmentResponseDto> {
    const {
      name,
      description,
      matchType,
      gender = [],
      properties = [],
      countries = [],
      states = [],
      trafficSources = [],
      agentIds = [],
      partnerIds = [],
      minTotalSpent,
      maxTotalSpent,
    } = createSegmentDto;

    // Validate at least one criteria is provided
    if (
      !gender.length &&
      !properties.length &&
      !countries.length &&
      !states.length &&
      !trafficSources.length &&
      !agentIds.length &&
      !partnerIds.length &&
      minTotalSpent === undefined &&
      maxTotalSpent === undefined
    ) {
      throw new BadRequestException(
        'At least one filter criteria must be provided',
      );
    }

    // Validate spending range
    if (
      minTotalSpent !== undefined &&
      maxTotalSpent !== undefined &&
      minTotalSpent > maxTotalSpent
    ) {
      throw new BadRequestException(
        'minTotalSpent cannot be greater than maxTotalSpent',
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

    // Validate state IDs exist
    if (states.length > 0) {
      const validStates = await this.prisma.state.count({
        where: { id: { in: states } },
      });
      if (validStates !== states.length) {
        throw new BadRequestException('One or more state IDs are invalid');
      }
    }

    // Create segment in database with PROCESSING status first
    const segment = await this.prisma.segment.create({
      data: {
        name,
        description,
        matchType,
        status: 'PROCESSING',
        gender,
        properties,
        countries,
        states,
        trafficSources,
        agentIds,
        partnerIds,
        minTotalSpent,
        maxTotalSpent,
        createdBy: adminId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Try to create Brevo list
    let brevoListId: string | null = null;
    let finalStatus: 'CREATED' | 'FAILED' = 'CREATED';

    try {
      brevoListId = await this.brevoService.createList(name, description);
    } catch (error) {
      this.logger.error(`Failed to create Brevo list: ${error.message}`);
      finalStatus = 'FAILED';
    }

    // Update segment with final status and brevoListId
    const updatedSegment = await this.prisma.segment.update({
      where: { id: segment.id },
      data: {
        status: finalStatus,
        brevoListId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return await this.mapSegmentToResponse(updatedSegment);
  }

  async findAllSegments(
    query: SegmentListQueryDto,
  ): Promise<PaginatedSegmentResponseDto> {
    const { search, page = 1, limit = 10, createdBy, status } = query;

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

    if (status) {
      where.status = status;
    }

    const [segments, total] = await Promise.all([
      this.prisma.segment.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
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
      data: await Promise.all(segments.map((segment) => this.mapSegmentToResponse(segment))),
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
            firstName: true,
            lastName: true,
            otherName: true,
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

    return await this.mapSegmentToResponse(segment);
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

    // Cannot update segment if it's still processing
    if (segment.status === 'PROCESSING') {
      throw new BadRequestException(
        'Cannot update segment while it is still processing',
      );
    }

    const { name, description } = updateSegmentDto;

    // Update Brevo list if name or description changed
    if ((name || description !== undefined) && segment.brevoListId) {
      try {
        await this.brevoService.updateList(
          segment.brevoListId,
          name || segment.name,
          description !== undefined ? description : segment.description,
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
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    return await this.mapSegmentToResponse(updatedSegment);
  }

  async deleteSegment(id: string): Promise<void> {
    const segment = await this.prisma.segment.findUnique({
      where: { id },
    });

    if (!segment) {
      throw new NotFoundException('Segment not found');
    }

    // Cannot delete segment if it's still processing
    if (segment.status === 'PROCESSING') {
      throw new BadRequestException(
        'Cannot delete segment while it is still processing',
      );
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

    // Get all matching client IDs first
    const allMatchingClients = await this.prisma.client.findMany({
      where,
      select: { id: true },
    });

    let filteredClientIds = allMatchingClients.map((c) => c.id);

    // Apply spending filter if specified
    if (segment.minTotalSpent !== undefined || segment.maxTotalSpent !== undefined) {
      const minSpent = segment.minTotalSpent?.toNumber();
      const maxSpent = segment.maxTotalSpent?.toNumber();
      filteredClientIds = await this.filterClientsBySpending(
        filteredClientIds,
        minSpent,
        maxSpent,
      );
    }

    const total = filteredClientIds.length;

    // Apply pagination
    const paginatedClientIds = filteredClientIds.slice(
      (page - 1) * limit,
      page * limit,
    );

    // Fetch full client data for paginated results
    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: paginatedClientIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        otherName: true,
        phone: true,
        gender: true,
        country: true,
        state: {
          select: {
            name: true,
          },
        },
        referralSource: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      data: clients.map((client) => ({
        id: client.id,
        name: formatFullName(client.firstName, client.lastName, client.otherName) || '',
        email: client.user?.email || '',
        phone: client.phone || '',
        gender: client.gender || '',
        country: client.country || '',
        state: client.state?.name || '',
        referralSource: client.referralSource as any,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async syncSegmentToBrevo(
    id: string,
    adminId: string,
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

    // Get all matching client IDs first
    const allMatchingClients = await this.prisma.client.findMany({
      where,
      select: { id: true },
    });

    let filteredClientIds = allMatchingClients.map((c) => c.id);

    // Apply spending filter if specified
    if (segment.minTotalSpent !== undefined || segment.maxTotalSpent !== undefined) {
      const minSpent = segment.minTotalSpent?.toNumber();
      const maxSpent = segment.maxTotalSpent?.toNumber();
      filteredClientIds = await this.filterClientsBySpending(
        filteredClientIds,
        minSpent,
        maxSpent,
      );
    }

    // Get full client data for filtered clients
    const clients = await this.prisma.client.findMany({
      where: {
        id: { in: filteredClientIds },
      },
      select: {
        firstName: true,
        lastName: true,
        otherName: true,
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
          name: formatFullName(client.firstName, client.lastName, client.otherName),
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
        exportedBy: adminId,
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

  private async filterClientsBySpending(
    clientIds: string[],
    minSpent?: number,
    maxSpent?: number,
  ): Promise<string[]> {
    if (minSpent === undefined && maxSpent === undefined) {
      return clientIds;
    }

    // Get total spending for each client
    const clientSpending = await this.prisma.enrollment.groupBy({
      by: ['clientId'],
      where: {
        clientId: { in: clientIds },
      },
      _sum: {
        amountPaid: true,
      },
    });

    // Filter based on spending criteria
    const filteredClientIds = clientSpending
      .filter((spending) => {
        const totalSpent = spending._sum.amountPaid?.toNumber() || 0;
        const meetsMin = minSpent === undefined || totalSpent >= minSpent;
        const meetsMax = maxSpent === undefined || totalSpent <= maxSpent;
        return meetsMin && meetsMax;
      })
      .map((spending) => spending.clientId)
      .filter((id): id is string => id !== null);

    return filteredClientIds;
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
        stateId: {
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

    // Combine all conditions based on matchType
    if (conditions.length === 0) {
      return {};
    }

    // Use OR logic if matchType is 'ANY', otherwise use AND logic
    if (segment.matchType === 'ANY') {
      return {
        OR: conditions,
      };
    }

    return {
      AND: conditions,
    };
  }

  private async calculateClientsCount(segment: any): Promise<number> {
    const where = this.buildSegmentQuery(segment);

    // Get all matching client IDs first
    const allMatchingClients = await this.prisma.client.findMany({
      where,
      select: { id: true },
    });

    let filteredClientIds = allMatchingClients.map((c) => c.id);

    // Apply spending filter if specified
    if (segment.minTotalSpent !== undefined || segment.maxTotalSpent !== undefined) {
      const minSpent = segment.minTotalSpent?.toNumber?.() || segment.minTotalSpent;
      const maxSpent = segment.maxTotalSpent?.toNumber?.() || segment.maxTotalSpent;
      filteredClientIds = await this.filterClientsBySpending(
        filteredClientIds,
        minSpent,
        maxSpent,
      );
    }

    return filteredClientIds.length;
  }

  private async mapSegmentToResponse(segment: any): Promise<SegmentResponseDto> {
    const clientsCount = await this.calculateClientsCount(segment);
    return {
      id: segment.id,
      name: segment.name,
      description: segment.description,
      matchType: segment.matchType,
      status: segment.status,
      gender: segment.gender,
      properties: segment.properties,
      countries: segment.countries,
      states: segment.states,
      trafficSources: segment.trafficSources,
      agentIds: segment.agentIds,
      partnerIds: segment.partnerIds,
      minTotalSpent: segment.minTotalSpent?.toNumber(),
      maxTotalSpent: segment.maxTotalSpent?.toNumber(),
      brevoListId: segment.brevoListId,
      clientsCount,
      creator: {
        id: segment.creator.id,
        name: formatFullName(segment.creator.firstName, segment.creator.lastName, segment.creator.otherName) || '',
        email: segment.creator.user?.email || '',
      },
      createdAt: segment.createdAt,
      updatedAt: segment.updatedAt,
    };
  }

  async getAllBrevoContacts(
    query: BrevoContactsQueryDto,
  ): Promise<BrevoContactsResponseDto> {
    const { page = 1, limit = 10, search, listId } = query;

    const { contacts, count } = await this.brevoService.getAllContacts(
      page,
      limit,
      search,
      listId,
    );

    const mappedContacts = contacts.map((contact: any) => ({
      id: contact.id?.toString() || '',
      email: contact.email || '',
      name: contact.attributes?.NAME || '',
      phone: contact.attributes?.PHONE || '',
      listIds: contact.listIds || [],
      createdAt: contact.createdAt || '',
      modifiedAt: contact.modifiedAt || '',
    }));

    return {
      data: mappedContacts,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async deleteBrevoContact(identifier: string): Promise<void> {
    await this.brevoService.deleteContact(identifier);
  }
}
