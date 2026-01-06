import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto, userId: string) {
    const {
      unitPricing,
      paymentPlans,
      features,
      media,
      agriculturalFee,
      salesDiscount,
      mapConfig,
      ...propertyData
    } = createPropertyDto;

    return this.prisma.property.create({
      data: {
        ...propertyData,
        agriculturalFeeAmount: agriculturalFee?.amount,
        agriculturalFeeIsActive: agriculturalFee?.isActive ?? false,
        salesDiscountPercentage: salesDiscount?.percentage,
        salesDiscountIsActive: salesDiscount?.isActive ?? false,
        mapConfigSrc: mapConfig?.src,
        mapConfigWidth: mapConfig?.width,
        mapConfigHeight: mapConfig?.height,
        createdBy: userId,
        lastUpdatedBy: userId,
        unitPricing: {
          create: unitPricing,
        },
        paymentPlans: {
          create: paymentPlans,
        },
        features: {
          create: features,
        },
        media: {
          create: media,
        },
      },
      include: {
        state: true,
        unitPricing: true,
        paymentPlans: true,
        features: true,
        media: true,
      },
    });
  }

  async findAll(queryDto: QueryPropertiesDto) {
    const {
      page,
      limit,
      type,
      status,
      stateId,
      priceMin,
      priceMax,
      search,
      sortBy,
      sortOrder,
      includeArchived,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Prisma.PropertyWhereInput = {
      ...(type && { type }),
      ...(status && { status }),
      ...(stateId && { stateId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(!includeArchived && { status: { not: 'ARCHIVED' } }),
    };

    if (priceMin !== undefined || priceMax !== undefined) {
      where.unitPricing = {
        some: {
          AND: [
            ...(priceMin !== undefined
              ? [{ regularPrice: { gte: priceMin } }]
              : []),
            ...(priceMax !== undefined
              ? [{ regularPrice: { lte: priceMax } }]
              : []),
          ],
        },
      };
    }

    let orderBy: Prisma.PropertyOrderByWithRelationInput = {};
    if (sortBy === 'name') {
      orderBy = { name: sortOrder };
    } else if (sortBy === 'views') {
      orderBy = { views: sortOrder };
    } else {
      orderBy = { createdAt: sortOrder };
    }

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          state: true,
          unitPricing: true,
          paymentPlans: true,
          features: true,
          media: true,
          _count: {
            select: { units: true },
          },
        },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        state: true,
        unitPricing: true,
        paymentPlans: true,
        features: true,
        media: true,
        _count: {
          select: { units: true },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return property;
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const {
      features,
      media,
      agriculturalFee,
      salesDiscount,
      mapConfig,
      ...propertyData
    } = updatePropertyDto;

    const updateData: any = {
      ...propertyData,
      lastUpdatedBy: userId,
    };

    if (agriculturalFee) {
      updateData.agriculturalFeeAmount = agriculturalFee.amount;
      updateData.agriculturalFeeIsActive = agriculturalFee.isActive;
    }

    if (salesDiscount) {
      updateData.salesDiscountPercentage = salesDiscount.percentage;
      updateData.salesDiscountIsActive = salesDiscount.isActive;
    }

    if (mapConfig) {
      updateData.mapConfigSrc = mapConfig.src;
      updateData.mapConfigWidth = mapConfig.width;
      updateData.mapConfigHeight = mapConfig.height;
    }

    if (features) {
      await this.prisma.propertyFeature.deleteMany({
        where: { propertyId: id },
      });
      updateData.features = {
        create: features,
      };
    }

    if (media) {
      await this.prisma.propertyMedia.deleteMany({
        where: { propertyId: id },
      });
      updateData.media = {
        create: media,
      };
    }

    return this.prisma.property.update({
      where: { id },
      data: updateData,
      include: {
        state: true,
        unitPricing: true,
        paymentPlans: true,
        features: true,
        media: true,
      },
    });
  }

  async archive(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        lastUpdatedBy: userId,
      },
      include: {
        state: true,
        unitPricing: true,
        paymentPlans: true,
        features: true,
        media: true,
      },
    });
  }
}
