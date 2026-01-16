import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import {
  ApiStandardResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-standard-responses.decorator';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { AddPaymentPlanDto } from './dto/add-payment-plan.dto';
import { AddUnitPricingDto } from './dto/add-unit-pricing.dto';
import { UpdatePropertyInterestDto } from './dto/update-interest.dto';
import { PropertyStatsDto } from './dto/property-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { KycCompletionGuard } from '../common/guards/kyc-completion.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { Request } from 'express';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List properties with pagination, search, and filters' })
  @ApiStandardResponse(200, 'Returns paginated properties list with filters')
  findAll(@Query() queryDto: QueryPropertiesDto) {
    return this.propertiesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID with full details' })
  @ApiStandardResponse(200, 'Property details retrieved successfully')
  @ApiNotFoundResponse('Property')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Get(':id/map')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard, KycCompletionGuard)
  @ApiOperation({ summary: 'Get property map configuration (requires verified KYC)' })
  @ApiResponse({ status: 200, description: 'Property map configuration retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - KYC verification required' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getPropertyMap(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    return {
      mapConfigSrc: property.mapConfigSrc,
      mapConfigWidth: property.mapConfigWidth,
      mapConfigHeight: property.mapConfigHeight,
    };
  }

  @Get(':id/plots')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard, KycCompletionGuard)
  @ApiOperation({ summary: 'Get property plots/units (requires verified KYC)' })
  @ApiResponse({ status: 200, description: 'Property plots/units retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - KYC verification required' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getPropertyPlots(@Param('id') id: string) {
    const units = await this.propertiesService.getPropertyUnits(id);
    return units;
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Create a new property (admin only)' })
  @ApiBody({ type: CreatePropertyDto })
  @ApiStandardResponse(201, 'Property created successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.propertiesService.create(createPropertyDto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Update property details (admin only)' })
  @ApiBody({ type: UpdatePropertyDto })
  @ApiStandardResponse(200, 'Property updated successfully')
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse('Property')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.propertiesService.update(id, updatePropertyDto, userId);
  }

  @Patch(':id/archive')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Archive property (admin only)' })
  @ApiResponse({ status: 200, description: 'Property archived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  archive(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.propertiesService.archive(id, userId);
  }

  @Patch(':id/unarchive')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Unarchive property and set status to AVAILABLE (admin only)' })
  @ApiResponse({ status: 200, description: 'Property unarchived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  unarchive(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.propertiesService.unarchive(id, userId);
  }

  // Payment plans management
  @Post(':id/payment-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Add payment plan to existing property (admin only)' })
  @ApiResponse({ status: 201, description: 'Payment plan added successfully' })
  @ApiResponse({ status: 400, description: 'Payment plan already exists' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  addPaymentPlan(
    @Param('id') id: string,
    @Body() dto: AddPaymentPlanDto,
  ) {
    return this.propertiesService.addPaymentPlan(id, dto.durationMonths, dto.interestRate);
  }

  // Unit pricing management
  @Post(':id/unit-pricing')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Add unit pricing to existing property (admin only)' })
  @ApiResponse({ status: 201, description: 'Unit pricing added successfully' })
  @ApiResponse({ status: 400, description: 'Unit pricing already exists' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  addUnitPricing(
    @Param('id') id: string,
    @Body() dto: AddUnitPricingDto,
  ) {
    return this.propertiesService.addUnitPricing(id, dto.unit, dto.regularPrice, dto.prelaunchPrice);
  }

  // Property interests management
  @Patch(':id/interests/:interestId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Update property interest status (admin only)' })
  @ApiResponse({ status: 200, description: 'Property interest updated successfully' })
  @ApiResponse({ status: 404, description: 'Property interest not found' })
  updatePropertyInterest(
    @Param('interestId') interestId: string,
    @Body() dto: UpdatePropertyInterestDto,
  ) {
    return this.propertiesService.updatePropertyInterest(
      interestId,
      dto.status,
      dto.agentId,
    );
  }

  // Property stats
  @Get('stats/overview')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('properties', 'manage')
  @ApiOperation({ summary: 'Get property statistics for admin dashboard (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Property statistics retrieved successfully',
    type: PropertyStatsDto,
  })
  getPropertyStats() {
    return this.propertiesService.getPropertyStats();
  }
}
