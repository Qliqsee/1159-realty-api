import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { BatchCreateLeadsDto } from './dto/batch-create-leads.dto';
import { CloseLeadDto } from './dto/close-lead.dto';
import { AddFeedbackDto } from './dto/add-feedback.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { LeadStatus, Prisma } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, userId: string) {
    // Auto-reserve for 1 week when agent creates lead
    const reservationExpiresAt = new Date();
    reservationExpiresAt.setDate(reservationExpiresAt.getDate() + 7);

    const lead = await this.prisma.lead.create({
      data: {
        email: createLeadDto.email,
        firstName: createLeadDto.firstName,
        lastName: createLeadDto.lastName,
        phone: createLeadDto.phone,
        addedBy: userId,
        status: LeadStatus.RESERVED,
        reservedBy: userId,
        reservationExpiresAt,
        statusChangedAt: new Date(),
        statusChangedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        reserver: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    // Track agent assignment history
    await this.prisma.leadAgentHistory.create({
      data: {
        leadId: lead.id,
        agentId: userId,
        reason: 'Lead created by agent',
      },
    });

    return lead;
  }

  async batchCreate(
    batchCreateLeadsDto: BatchCreateLeadsDto,
    userId: string,
  ) {
    const results = {
      successful: [],
      failed: [],
    };

    for (const leadItem of batchCreateLeadsDto.leads) {
      try {
        let assignedAgentId = userId;

        // If agent email is provided, find that agent
        if (leadItem.agentEmail) {
          const agent = await this.prisma.user.findUnique({
            where: { email: leadItem.agentEmail },
            include: {
              userRoles: {
                include: {
                  role: true,
                },
              },
            },
          });

          if (!agent) {
            results.failed.push({
              email: leadItem.email,
              reason: `Agent with email ${leadItem.agentEmail} not found`,
            });
            continue;
          }

          // Verify the user is an agent
          const isAgent = agent.userRoles.some(
            (ur) =>
              ur.role.name.toLowerCase() === 'agent' ||
              ur.role.name.toLowerCase() === 'admin',
          );

          if (!isAgent) {
            results.failed.push({
              email: leadItem.email,
              reason: `User ${leadItem.agentEmail} is not an agent`,
            });
            continue;
          }

          assignedAgentId = agent.id;
        }

        // Create lead without auto-reservation (company leads)
        const lead = await this.prisma.lead.create({
          data: {
            email: leadItem.email,
            firstName: leadItem.firstName,
            lastName: leadItem.lastName,
            phone: leadItem.phone,
            addedBy: userId,
            status: LeadStatus.AVAILABLE,
          },
        });

        results.successful.push({
          id: lead.id,
          email: lead.email,
          assignedTo: assignedAgentId,
        });
      } catch (error) {
        results.failed.push({
          email: leadItem.email,
          reason: error.message || 'Unknown error',
        });
      }
    }

    return results;
  }

  async findAll(query: LeadQueryDto) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {};

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.reservedBy) {
      where.reservedBy = query.reservedBy;
    }

    if (query.addedBy) {
      where.addedBy = query.addedBy;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          reserver: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          closer: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMyLeads(userId: string, query: LeadQueryDto) {
    const modifiedQuery = {
      ...query,
      reservedBy: userId,
    };

    return this.findAll(modifiedQuery);
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        reserver: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        closer: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        feedbacks: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                user: { select: { email: true } },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id);

    return this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        reserver: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async reserve(id: string, userId: string) {
    const lead = await this.findOne(id);

    if (lead.status === LeadStatus.CLOSED) {
      throw new BadRequestException('Cannot reserve a closed lead');
    }

    if (
      lead.status === LeadStatus.RESERVED &&
      lead.reservationExpiresAt > new Date()
    ) {
      throw new BadRequestException(
        'Lead is already reserved by another agent',
      );
    }

    // Check if agent is suspended
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isSuspended: true },
    });

    if (user.isSuspended) {
      throw new ForbiddenException('Suspended agents cannot reserve leads');
    }

    // Set reservation for 48 hours
    const reservationExpiresAt = new Date();
    reservationExpiresAt.setHours(reservationExpiresAt.getHours() + 48);

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.RESERVED,
        reservedBy: userId,
        reservationExpiresAt,
        statusChangedAt: new Date(),
        statusChangedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
        reserver: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    });

    // Track agent assignment
    await this.prisma.leadAgentHistory.create({
      data: {
        leadId: id,
        agentId: userId,
        reason: 'Lead reserved',
      },
    });

    return updatedLead;
  }

  async makeAvailable(id: string, userId: string) {
    const lead = await this.findOne(id);

    if (lead.status === LeadStatus.CLOSED) {
      throw new BadRequestException('Cannot make a closed lead available');
    }

    // Unassign previous agent if any
    if (lead.reservedBy) {
      await this.prisma.leadAgentHistory.updateMany({
        where: {
          leadId: id,
          agentId: lead.reservedBy,
          unassignedAt: null,
        },
        data: {
          unassignedAt: new Date(),
          reason: 'Made available by Head of Sales',
        },
      });
    }

    return this.prisma.lead.update({
      where: { id },
      data: {
        status: LeadStatus.AVAILABLE,
        reservedBy: null,
        reservationExpiresAt: null,
        statusChangedAt: new Date(),
        statusChangedBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async close(id: string, closeLeadDto: CloseLeadDto, userId: string) {
    const lead = await this.findOne(id);

    if (lead.status === LeadStatus.CLOSED) {
      throw new BadRequestException('Lead is already closed');
    }

    // Find client by email
    const client = await this.prisma.user.findUnique({
      where: { email: closeLeadDto.clientEmail },
    });

    if (!client) {
      throw new NotFoundException(
        'Client with this email does not exist in the system',
      );
    }

    // Check if another lead is already closed with this email
    const existingClosedLead = await this.prisma.lead.findFirst({
      where: {
        clientId: client.id,
        status: LeadStatus.CLOSED,
        id: { not: id },
      },
    });

    if (existingClosedLead) {
      throw new BadRequestException(
        'Another lead is already closed with this client email',
      );
    }

    // Update lead and link to client
    const updatedLead = await this.prisma.$transaction(async (tx) => {
      // Update client with lead information
      await tx.client.update({
        where: { id: client.id },
        data: {
          leadId: id,
          closedBy: userId,
        },
      });

      // Update lead
      const closedLead = await tx.lead.update({
        where: { id },
        data: {
          status: LeadStatus.CLOSED,
          closedBy: userId,
          clientId: client.id,
          statusChangedAt: new Date(),
          statusChangedBy: userId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          closer: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              user: { select: { email: true } },
            },
          },
        },
      });

      // Close agent history for this lead
      await tx.leadAgentHistory.updateMany({
        where: {
          leadId: id,
          unassignedAt: null,
        },
        data: {
          unassignedAt: new Date(),
          reason: 'Lead closed',
        },
      });

      return closedLead;
    });

    return updatedLead;
  }

  async addFeedback(id: string, addFeedbackDto: AddFeedbackDto, userId: string) {
    await this.findOne(id);

    return this.prisma.leadFeedback.create({
      data: {
        leadId: id,
        agentId: userId,
        comment: addFeedbackDto.comment,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            user: { select: { email: true } },
          },
        },
      },
    });
  }

  async getFeedbacks(id: string, query: LeadQueryDto) {
    await this.findOne(id);

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      this.prisma.leadFeedback.findMany({
        where: { leadId: id },
        skip,
        take: limit,
        include: {
          agent: {
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.leadFeedback.count({ where: { leadId: id } }),
    ]);

    return {
      data: feedbacks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAgentHistory(id: string, query: LeadQueryDto) {
    await this.findOne(id);

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      this.prisma.leadAgentHistory.findMany({
        where: { leadId: id },
        skip,
        take: limit,
        include: {
          agent: {
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
        orderBy: {
          assignedAt: 'desc',
        },
      }),
      this.prisma.leadAgentHistory.count({ where: { leadId: id } }),
    ]);

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [total, closed, available, reserved] = await Promise.all([
      this.prisma.lead.count(),
      this.prisma.lead.count({ where: { status: LeadStatus.CLOSED } }),
      this.prisma.lead.count({ where: { status: LeadStatus.AVAILABLE } }),
      this.prisma.lead.count({ where: { status: LeadStatus.RESERVED } }),
    ]);

    const conversionRate = total > 0 ? (closed / total) * 100 : 0;

    return {
      total,
      closed,
      available,
      reserved,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async getMyStats(userId: string) {
    // Get all leads where agent was involved (created, reserved, or closed)
    const [myTotal, myClosed] = await Promise.all([
      this.prisma.leadAgentHistory.findMany({
        where: { agentId: userId },
        distinct: ['leadId'],
      }),
      this.prisma.lead.count({
        where: {
          closedBy: userId,
          status: LeadStatus.CLOSED,
        },
      }),
    ]);

    const total = myTotal.length;
    const conversionRate = total > 0 ? (myClosed / total) * 100 : 0;

    return {
      myTotal: total,
      myClosed,
      myConversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async autoResetExpiredReservations() {
    const now = new Date();

    const expiredLeads = await this.prisma.lead.findMany({
      where: {
        status: LeadStatus.RESERVED,
        reservationExpiresAt: {
          lte: now,
        },
      },
    });

    for (const lead of expiredLeads) {
      await this.prisma.$transaction(async (tx) => {
        // Update lead status
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            status: LeadStatus.AVAILABLE,
            reservedBy: null,
            reservationExpiresAt: null,
            statusChangedAt: now,
          },
        });

        // Close agent history
        await tx.leadAgentHistory.updateMany({
          where: {
            leadId: lead.id,
            unassignedAt: null,
          },
          data: {
            unassignedAt: now,
            reason: 'Reservation expired (48 hours)',
          },
        });
      });
    }

    if (expiredLeads.length > 0) {
      console.log(`Auto-reset ${expiredLeads.length} expired lead reservations`);
    }
  }
}
