import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { formatFullName } from '../common/utils/name.utils';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(clientId: string, createTicketDto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        clientId,
        category: createTicketDto.category,
        reason: createTicketDto.reason,
        attachments: createTicketDto.attachments || [],
      },
      include: {
        client: {
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

    return {
      message: 'Ticket created successfully',
      data: ticket,
    };
  }

  async findAll(query: TicketQueryDto) {
    const { page = 1, limit = 20, search, status, category, userId } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.reason = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (userId) {
      where.clientId = userId;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
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
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMy(clientId: string, query: TicketQueryDto) {
    const { page = 1, limit = 20, search, status, category } = query;
    const skip = (page - 1) * limit;

    const where: any = { clientId };

    if (search) {
      where.reason = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
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
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return {
      data: ticket,
    };
  }

  async updateStatus(id: string, updateTicketStatusDto: UpdateTicketStatusDto) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status: updateTicketStatusDto.status,
      },
      include: {
        client: {
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

    return {
      message: 'Ticket status updated successfully',
      data: updatedTicket,
    };
  }

  async getStats() {
    const [total, opened, closed] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({
        where: { status: 'OPENED' },
      }),
      this.prisma.supportTicket.count({
        where: { status: 'CLOSED' },
      }),
    ]);

    return {
      data: {
        total,
        opened,
        closed,
      },
    };
  }
}
