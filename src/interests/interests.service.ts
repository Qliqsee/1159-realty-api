import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestListQueryDto } from './dto/interest-list-query.dto';
import {
  InterestResponseDto,
  InterestPropertyDto,
  InterestClientDto,
  InterestAgentDto,
} from './dto/interest-response.dto';
import { InterestStatsDto } from './dto/interest-stats.dto';
import { PaginatedInterestResponseDto } from './dto/paginated-interest-response.dto';
import { Prisma } from '@prisma/client';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class InterestsService {
  constructor(private prisma: PrismaService) {}

  async create(createInterestDto: CreateInterestDto, userId: string) {
    const { propertyId, message } = createInterestDto;

    // Validate property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Get user's assigned agent (if any) from their enrollments
    let agentId: string | null = null;
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' },
      select: { agentId: true },
    });

    if (enrollment) {
      agentId = enrollment.agentId;
    }

    try {
      const interest = await this.prisma.propertyInterest.create({
        data: {
          propertyId,
          clientId: userId,
          message,
          agentId,
          status: 'OPEN',
        },
        include: {
          property: {
            include: {
              state: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              phone: true,
              user: { select: { email: true } },
            },
          },
        },
      });

      return this.transformToResponseDto(interest);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'You have already expressed interest in this property',
        );
      }
      throw error;
    }
  }

  async findAll(query: InterestListQueryDto): Promise<PaginatedInterestResponseDto> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      propertyId,
      clientId,
      agentId,
      createdFrom,
      createdTo,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PropertyInterestWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (agentId) {
      where.agentId = agentId;
    }

    if (createdFrom || createdTo) {
      where.createdAt = {};
      if (createdFrom) {
        where.createdAt.gte = new Date(createdFrom);
      }
      if (createdTo) {
        where.createdAt.lte = new Date(createdTo);
      }
    }

    // Search across client name, property name, agent name, and message
    if (search) {
      where.OR = [
        {
          client: {
            firstName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          client: {
            lastName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          client: {
            otherName: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          property: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          message: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [interests, total] = await Promise.all([
      this.prisma.propertyInterest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          property: {
            include: {
              state: true,
            },
          },
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              otherName: true,
              phone: true,
              user: { select: { email: true } },
            },
          },
        },
      }),
      this.prisma.propertyInterest.count({ where }),
    ]);

    // Fetch agent data for interests that have agentId
    const agentIds = interests
      .filter((i) => i.agentId)
      .map((i) => i.agentId)
      .filter((id): id is string => id !== null);

    const agents = agentIds.length > 0
      ? await this.prisma.admin.findMany({
          where: { id: { in: agentIds } },
          select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } }, phone: true },
        })
      : [];

    const agentMap = new Map(agents.map((a) => [a.id, a]));

    // Attach agents to interests
    const interestsWithAgents = interests.map((interest) => ({
      ...interest,
      agent: interest.agentId ? agentMap.get(interest.agentId) : null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: interestsWithAgents.map((interest) => this.transformToResponseDto(interest)),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findMyInterests(
    userId: string,
    query: InterestListQueryDto,
  ): Promise<PaginatedInterestResponseDto> {
    const modifiedQuery = { ...query, clientId: userId };
    return this.findAll(modifiedQuery);
  }

  async findOne(id: string, userId?: string, isAdmin = false): Promise<InterestResponseDto> {
    const interest = await this.prisma.propertyInterest.findUnique({
      where: { id },
      include: {
        property: {
          include: {
            state: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            phone: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    // Check authorization: clients can only view their own interests
    if (!isAdmin && userId && interest.clientId !== userId) {
      throw new ForbiddenException('You can only view your own interests');
    }

    // Fetch agent if agentId exists
    let agent = null;
    if (interest.agentId) {
      agent = await this.prisma.admin.findUnique({
        where: { id: interest.agentId },
        select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } }, phone: true },
      });
    }

    return this.transformToResponseDto({ ...interest, agent });
  }

  async markAsAttended(id: string): Promise<InterestResponseDto> {
    const interest = await this.prisma.propertyInterest.findUnique({
      where: { id },
    });

    if (!interest) {
      throw new NotFoundException('Interest not found');
    }

    if (interest.status === 'CLOSED') {
      throw new BadRequestException('Interest is already marked as attended');
    }

    const updatedInterest = await this.prisma.propertyInterest.update({
      where: { id },
      data: {
        status: 'CLOSED',
        contactedAt: new Date(),
      },
      include: {
        property: {
          include: {
            state: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            otherName: true,
            phone: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    // Fetch agent if agentId exists
    let agent = null;
    if (updatedInterest.agentId) {
      agent = await this.prisma.admin.findUnique({
        where: { id: updatedInterest.agentId },
        select: { id: true, firstName: true, lastName: true, otherName: true, user: { select: { email: true } }, phone: true },
      });
    }

    return this.transformToResponseDto({ ...updatedInterest, agent });
  }

  async getStats(): Promise<InterestStatsDto> {
    const [totalInterests, openInterests, closedInterests] = await Promise.all([
      this.prisma.propertyInterest.count(),
      this.prisma.propertyInterest.count({ where: { status: 'OPEN' } }),
      this.prisma.propertyInterest.count({ where: { status: 'CLOSED' } }),
    ]);

    return {
      totalInterests,
      openInterests,
      closedInterests,
    };
  }

  private transformToResponseDto(interest: any): InterestResponseDto {
    const property: InterestPropertyDto = {
      id: interest.property.id,
      name: interest.property.name,
      type: interest.property.type,
      subtype: interest.property.subtype,
      status: interest.property.status,
      country: interest.property.country,
      state: interest.property.state?.name,
    };

    const client: InterestClientDto = {
      id: interest.client.id,
      name: formatFullName(interest.client.firstName, interest.client.lastName, interest.client.otherName),
      email: interest.client.user?.email,
      phone: interest.client.phone,
    };

    let agent: InterestAgentDto | undefined;
    if (interest.agentId && interest.agent) {
      agent = {
        id: interest.agent.id,
        name: formatFullName(interest.agent.firstName, interest.agent.lastName, interest.agent.otherName),
        email: interest.agent.user?.email,
        phone: interest.agent.phone,
      };
    }

    return {
      id: interest.id,
      property,
      client,
      agent,
      message: interest.message,
      status: interest.status,
      contactedAt: interest.contactedAt,
      createdAt: interest.createdAt,
      updatedAt: interest.updatedAt,
    };
  }
}
