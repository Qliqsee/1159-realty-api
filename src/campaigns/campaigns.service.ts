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
    // Validate adminId exists
    if (!adminId) {
      throw new BadRequestException('Only admin users can create segments');
    }

    // Verify admin exists in database
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new BadRequestException(
        `Admin profile not found for adminId: ${adminId}. Please logout and login again to refresh your authentication token.`,
      );
    }

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
        'At least one filter criteria must be provided in conditions',
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

    // Build conditions object for storage
    const conditions = {
      gender,
      properties,
      countries,
      states,
      trafficSources,
      agentIds,
      partnerIds,
      minTotalSpent,
      maxTotalSpent,
    };

    // Create segment in database with PROCESSING status first
    const segment = await this.prisma.segment.create({
      data: {
        name,
        description,
        matchType,
        status: 'PROCESSING',
        conditions: conditions as any,
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

    try {
      brevoListId = await this.brevoService.createList(name, description);
    } catch (error) {
      this.logger.error(`Failed to create Brevo list: ${error.message}`);
      // Update segment to FAILED status
      await this.prisma.segment.update({
        where: { id: segment.id },
        data: { status: 'FAILED' },
      });
      throw new HttpException(
        'Failed to create segment in Brevo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Update segment with brevoListId (keep PROCESSING status)
    const updatedSegment = await this.prisma.segment.update({
      where: { id: segment.id },
      data: {
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

    // Fire background process to sync contacts
    this.syncSegmentInBackground(updatedSegment.id, brevoListId).catch((error) => {
      this.logger.error(`Background sync failed for segment ${updatedSegment.id}: ${error.message}`);
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
    const segmentConditions: any = segment.conditions || {};
    if (segmentConditions.minTotalSpent !== undefined || segmentConditions.maxTotalSpent !== undefined) {
      const minSpent = segmentConditions.minTotalSpent;
      const maxSpent = segmentConditions.maxTotalSpent;
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
    // Validate adminId exists
    if (!adminId) {
      throw new BadRequestException('Only admin users can sync segments');
    }

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
    const segmentConditions: any = segment.conditions || {};
    if (segmentConditions.minTotalSpent !== undefined || segmentConditions.maxTotalSpent !== undefined) {
      const minSpent = segmentConditions.minTotalSpent;
      const maxSpent = segmentConditions.maxTotalSpent;
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
    const [totalContacts, totalSegments] = await Promise.all([
      this.brevoService.getTotalContactsCount(),
      this.prisma.segment.count(),
    ]);

    return {
      totalContacts,
      totalSegments,
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
    const segmentConditions: any = segment.conditions || {};

    // Filter by gender
    if (segmentConditions.gender && segmentConditions.gender.length > 0) {
      conditions.push({
        gender: {
          in: segmentConditions.gender,
        },
      });
    }

    // Filter by properties (users enrolled in these properties)
    if (segmentConditions.properties && segmentConditions.properties.length > 0) {
      conditions.push({
        enrollmentsAsClient: {
          some: {
            propertyId: {
              in: segmentConditions.properties,
            },
          },
        },
      });
    }

    // Filter by countries
    if (segmentConditions.countries && segmentConditions.countries.length > 0) {
      conditions.push({
        country: {
          in: segmentConditions.countries,
        },
      });
    }

    // Filter by states
    if (segmentConditions.states && segmentConditions.states.length > 0) {
      conditions.push({
        stateId: {
          in: segmentConditions.states,
        },
      });
    }

    // Filter by traffic sources
    if (segmentConditions.trafficSources && segmentConditions.trafficSources.length > 0) {
      conditions.push({
        referralSource: {
          in: segmentConditions.trafficSources,
        },
      });
    }

    // Filter by agents (users who have enrollments with these agents or leads closed by these agents)
    if (segmentConditions.agentIds && segmentConditions.agentIds.length > 0) {
      conditions.push({
        OR: [
          {
            enrollmentsAsClient: {
              some: {
                agentId: {
                  in: segmentConditions.agentIds,
                },
              },
            },
          },
          {
            closedBy: {
              in: segmentConditions.agentIds,
            },
          },
        ],
      });
    }

    // Filter by partners
    if (segmentConditions.partnerIds && segmentConditions.partnerIds.length > 0) {
      conditions.push({
        referredByPartnerId: {
          in: segmentConditions.partnerIds,
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
      conditions: segment.conditions || {},
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

  /**
   * Background process to sync contacts to Brevo list after segment creation
   */
  private async syncSegmentInBackground(
    segmentId: string,
    brevoListId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Starting background sync for segment ${segmentId}`);

      // Fetch the segment
      const segment = await this.prisma.segment.findUnique({
        where: { id: segmentId },
      });

      if (!segment) {
        throw new Error('Segment not found');
      }

      // Build query to get matching clients
      const where = this.buildSegmentQuery(segment);

      // Get all matching client IDs first
      const allMatchingClients = await this.prisma.client.findMany({
        where,
        select: { id: true },
      });

      let filteredClientIds = allMatchingClients.map((c) => c.id);

      // Apply spending filter if specified
      const segmentConditions: any = segment.conditions || {};
      if (segmentConditions.minTotalSpent !== undefined || segmentConditions.maxTotalSpent !== undefined) {
        const minSpent = segmentConditions.minTotalSpent;
        const maxSpent = segmentConditions.maxTotalSpent;
        filteredClientIds = await this.filterClientsBySpending(
          filteredClientIds,
          minSpent,
          maxSpent,
        );
      }

      this.logger.log(`Found ${filteredClientIds.length} clients matching segment ${segmentId}`);

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

      // Format contacts for Brevo
      const contacts = clients.map((client) =>
        this.brevoService.formatContactForBrevo({
          email: client.user?.email || '',
          name: formatFullName(client.firstName, client.lastName, client.otherName),
          phone: client.phone,
        }),
      );

      // Sync to Brevo
      const syncedCount = await this.brevoService.syncContactsToList(
        brevoListId,
        contacts,
      );

      this.logger.log(`Successfully synced ${syncedCount} contacts to Brevo list ${brevoListId}`);

      // Update segment status to CREATED
      await this.prisma.segment.update({
        where: { id: segmentId },
        data: { status: 'CREATED' },
      });

      this.logger.log(`Segment ${segmentId} status updated to CREATED`);
    } catch (error) {
      this.logger.error(`Background sync failed for segment ${segmentId}: ${error.message}`);

      // Update segment status to FAILED
      await this.prisma.segment.update({
        where: { id: segmentId },
        data: { status: 'FAILED' },
      });

      throw error;
    }
  }
}
