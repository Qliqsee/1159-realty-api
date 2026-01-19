import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { CaseQueryDto } from './dto/case-query.dto';
import { MyCasesQueryDto } from './dto/my-cases-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CasesService {
  constructor(private prisma: PrismaService) {}

  async create(createCaseDto: CreateCaseDto) {
    if (createCaseDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: createCaseDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${createCaseDto.clientId} not found`,
        );
      }
    }

    const newCase = await this.prisma.case.create({
      data: {
        name: createCaseDto.name,
        title: createCaseDto.title,
        clientId: createCaseDto.clientId,
        propertyId: createCaseDto.propertyId,
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

    return newCase;
  }

  async findAll(query: CaseQueryDto) {
    const { page = 1, limit = 20, search, status, clientId, propertyId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CaseWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (propertyId) {
      where.propertyId = propertyId;
    }

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip,
        take: limit,
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
          requirements: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const caseItem = await this.prisma.case.findUnique({
      where: { id },
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
        requirements: {
          include: {
            sampleDocuments: true,
            submittedDocuments: {
              select: {
                id: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }

    return caseItem;
  }

  async update(id: string, updateCaseDto: UpdateCaseDto) {
    await this.findOne(id);

    if (updateCaseDto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: updateCaseDto.clientId },
      });
      if (!client) {
        throw new NotFoundException(
          `Client with ID ${updateCaseDto.clientId} not found`,
        );
      }
    }

    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        name: updateCaseDto.name,
        title: updateCaseDto.title,
        clientId: updateCaseDto.clientId,
        propertyId: updateCaseDto.propertyId,
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

    return updatedCase;
  }

  async updateStatus(id: string, updateCaseStatusDto: UpdateCaseStatusDto) {
    await this.findOne(id);

    const updatedCase = await this.prisma.case.update({
      where: { id },
      data: {
        status: updateCaseStatusDto.status,
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

    return updatedCase;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.case.delete({
      where: { id },
    });

    return { message: 'Case deleted successfully' };
  }

  async getStats() {
    const [total, pending, completed, rejected] = await Promise.all([
      this.prisma.case.count(),
      this.prisma.case.count({ where: { status: 'PENDING' } }),
      this.prisma.case.count({ where: { status: 'COMPLETED' } }),
      this.prisma.case.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      completed,
      rejected,
    };
  }

  async getMyCases(clientId: string, query: MyCasesQueryDto) {
    const { page = 1, limit = 20, search, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.CaseWhereInput = {
      clientId: clientId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [cases, total] = await Promise.all([
      this.prisma.case.findMany({
        where,
        skip,
        take: limit,
        include: {
          requirements: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.case.count({ where }),
    ]);

    return {
      data: cases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
