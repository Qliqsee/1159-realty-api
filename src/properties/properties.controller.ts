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
  ApiResponse,
} from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { QueryPropertiesDto } from './dto/query-properties.dto';
import { AddInspectionDateDto } from './dto/inspection.dto';
import { AddPaymentPlanDto } from './dto/add-payment-plan.dto';
import { UpdatePropertyInterestDto } from './dto/update-interest.dto';
import { PropertyStatsDto } from './dto/property-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { KycCompletionGuard } from '../common/guards/kyc-completion.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'List properties with pagination, search, and filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated properties list with filters',
  })
  findAll(@Query() queryDto: QueryPropertiesDto) {
    return this.propertiesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID with full details' })
  @ApiResponse({ status: 200, description: 'Property details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new property (admin only)' })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createPropertyDto: CreatePropertyDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.propertiesService.create(createPropertyDto, userId);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update property details (admin only)' })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Archive property (admin only)' })
  @ApiResponse({ status: 200, description: 'Property archived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  archive(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.propertiesService.archive(id, userId);
  }

  // Inspection dates management
  @Get(':id/inspections')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get property inspection dates (admin only)' })
  @ApiResponse({ status: 200, description: 'Inspection dates retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  getInspectionDates(@Param('id') id: string) {
    return this.propertiesService.getInspectionDates(id);
  }

  @Post(':id/inspections')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add inspection date to property (admin only)' })
  @ApiResponse({ status: 201, description: 'Inspection date added successfully' })
  @ApiResponse({ status: 400, description: 'Inspection date already exists' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  addInspectionDate(
    @Param('id') id: string,
    @Body() dto: AddInspectionDateDto,
  ) {
    return this.propertiesService.addInspectionDate(id, new Date(dto.inspectionDate));
  }

  @Delete(':id/inspections/:inspectionDate')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove inspection date from property (admin only)' })
  @ApiResponse({ status: 200, description: 'Inspection date removed successfully' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  removeInspectionDate(
    @Param('id') id: string,
    @Param('inspectionDate') inspectionDate: string,
  ) {
    return this.propertiesService.removeInspectionDate(id, new Date(inspectionDate));
  }

  // Payment plans management
  @Post(':id/payment-plans')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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

  // Property interests management
  @Patch(':id/interests/:interestId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
