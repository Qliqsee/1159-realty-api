import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BatchCreateUnitsDto } from './dto/batch-create-units.dto';
import { QueryUnitsDto } from './dto/query-units.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UnitsService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id: createUnitDto.propertyId },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    const existingUnit = await this.prisma.unit.findUnique({
      where: {
        propertyId_unitId: {
          propertyId: createUnitDto.propertyId,
          unitId: createUnitDto.unitId,
        },
      },
    });

    if (existingUnit) {
      throw new BadRequestException(
        `Unit with ID ${createUnitDto.unitId} already exists for this property`,
      );
    }

    return this.prisma.unit.create({
      data: createUnitDto,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async batchCreate(propertyId: string, batchDto: BatchCreateUnitsDto) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    const unitIds = batchDto.units.map((u) => u.unitId);
    const duplicates = unitIds.filter(
      (item, index) => unitIds.indexOf(item) !== index,
    );

    if (duplicates.length > 0) {
      throw new BadRequestException(
        `Duplicate unit IDs found in batch: ${duplicates.join(', ')}`,
      );
    }

    const existingUnits = await this.prisma.unit.findMany({
      where: {
        propertyId,
        unitId: { in: unitIds },
      },
    });

    if (existingUnits.length > 0) {
      throw new BadRequestException(
        `The following unit IDs already exist: ${existingUnits.map((u) => u.unitId).join(', ')}`,
      );
    }

    const unitsToCreate = batchDto.units.map((unit) => ({
      ...unit,
      propertyId,
    }));

    const result = await this.prisma.$transaction(
      async (tx) => {
        return await tx.unit.createMany({
          data: unitsToCreate,
        });
      },
    );

    return {
      message: `Successfully created ${result.count} units`,
      count: result.count,
    };
  }

  async findAllByProperty(propertyId: string, queryDto: QueryUnitsDto) {
    const propertyExists = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!propertyExists) {
      throw new NotFoundException('Property not found');
    }

    const { page, limit, status, includeArchived } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.UnitWhereInput = {
      propertyId,
      ...(status && { status }),
      ...(!includeArchived && { status: { not: 'ARCHIVED' } }),
    };

    const [units, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      data: units,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(id: string, updateUnitDto: UpdateUnitDto) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    if (updateUnitDto.unitId) {
      const existingUnit = await this.prisma.unit.findFirst({
        where: {
          propertyId: unit.propertyId,
          unitId: updateUnitDto.unitId,
          id: { not: id },
        },
      });

      if (existingUnit) {
        throw new BadRequestException(
          `Unit with ID ${updateUnitDto.unitId} already exists for this property`,
        );
      }
    }

    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async archive(id: string) {
    const unit = await this.prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return this.prisma.unit.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }
}
