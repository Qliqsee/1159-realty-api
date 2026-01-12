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
import { formatFullName } from '../common/utils/name.utils';

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
      subtype,
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
      ...(subtype && { subtype: { contains: subtype, mode: 'insensitive' } }),
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
            select: {
              units: true,
              propertyInterests: true,
            },
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
          select: {
            units: true,
            propertyInterests: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Calculate next inspection date
    const now = new Date();
    const upcomingInspections = property.inspectionDates
      .filter((date) => new Date(date) > now)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
      ...property,
      nextInspectionDate: upcomingInspections[0] || null,
    };
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

  async getPropertyUnits(propertyId: string) {
    // First verify property exists
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Get all units for this property
    const units = await this.prisma.unit.findMany({
      where: { propertyId },
      orderBy: { unit: 'asc' },
    });

    return units;
  }

  // Inspection dates management
  async addInspectionDate(propertyId: string, inspectionDate: Date) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if inspection date already exists
    const existingDate = property.inspectionDates.find(
      (date) => new Date(date).getTime() === new Date(inspectionDate).getTime(),
    );

    if (existingDate) {
      throw new BadRequestException('Inspection date already exists');
    }

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        inspectionDates: {
          push: inspectionDate,
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

  async getInspectionDates(propertyId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, name: true, inspectionDates: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async removeInspectionDate(propertyId: string, inspectionDate: Date) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const updatedDates = property.inspectionDates.filter(
      (date) => new Date(date).getTime() !== new Date(inspectionDate).getTime(),
    );

    return this.prisma.property.update({
      where: { id: propertyId },
      data: {
        inspectionDates: updatedDates,
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

  // Payment plans management
  async addPaymentPlan(
    propertyId: string,
    durationMonths: number,
    interestRate: number,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      include: { paymentPlans: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if payment plan already exists
    const existingPlan = property.paymentPlans.find(
      (plan) =>
        plan.durationMonths === durationMonths &&
        parseFloat(plan.interestRate.toString()) === interestRate,
    );

    if (existingPlan) {
      throw new BadRequestException('Payment plan already exists');
    }

    return this.prisma.propertyPaymentPlan.create({
      data: {
        propertyId,
        durationMonths,
        interestRate,
      },
    });
  }

  // Property interests management
  async updatePropertyInterest(
    interestId: string,
    status?: string,
    agentId?: string,
  ) {
    const interest = await this.prisma.propertyInterest.findUnique({
      where: { id: interestId },
    });

    if (!interest) {
      throw new NotFoundException('Property interest not found');
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'CLOSED') {
        updateData.contactedAt = new Date();
      }
    }
    if (agentId) {
      updateData.agentId = agentId;
    }

    return this.prisma.propertyInterest.update({
      where: { id: interestId },
      data: updateData,
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
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
  }

  // Property stats
  async getPropertyStats() {
    const [
      totalProperties,
      totalLand,
      totalApartments,
      totalSoldOut,
      totalAvailable,
      totalInterests,
      enrollmentStats,
      activeEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
    ] = await Promise.all([
      this.prisma.property.count({
        where: { status: { not: 'ARCHIVED' } },
      }),
      this.prisma.property.count({
        where: { type: 'LAND', status: { not: 'ARCHIVED' } },
      }),
      this.prisma.property.count({
        where: { type: 'APARTMENT', status: { not: 'ARCHIVED' } },
      }),
      this.prisma.property.count({
        where: { status: 'SOLD_OUT' },
      }),
      this.prisma.property.count({
        where: { status: 'AVAILABLE' },
      }),
      this.prisma.propertyInterest.count(),
      this.prisma.enrollment.aggregate({
        _count: true,
        _sum: { totalAmount: true, amountPaid: true },
        _avg: { totalAmount: true },
      }),
      this.prisma.enrollment.count({ where: { status: 'ONGOING' } }),
      this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.enrollment.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.enrollment.count({ where: { status: 'CANCELLED' } }),
    ]);

    const totalEnrollmentRevenue = Number(enrollmentStats._sum.totalAmount || 0);
    const collectedRevenue = Number(enrollmentStats._sum.amountPaid || 0);
    const pendingRevenue = totalEnrollmentRevenue - collectedRevenue;
    const averageEnrollmentValue = Number(enrollmentStats._avg.totalAmount || 0);

    return {
      totalProperties,
      totalLand,
      totalApartments,
      totalSoldOut,
      totalAvailable,
      mostSoldProperty: null,
      totalInterests,
      totalEnrollments: enrollmentStats._count,
      activeEnrollments,
      completedEnrollments,
      suspendedEnrollments,
      cancelledEnrollments,
      totalEnrollmentRevenue,
      collectedRevenue,
      pendingRevenue,
      averageEnrollmentValue,
    };
  }
}
