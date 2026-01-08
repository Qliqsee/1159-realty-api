import {
  Controller,
  Get,
  Post,
  Patch,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
}
