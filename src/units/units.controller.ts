import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BatchCreateUnitsDto } from './dto/batch-create-units.dto';
import { QueryUnitsDto } from './dto/query-units.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Units')
@Controller()
export class UnitsController {
  constructor(private unitsService: UnitsService) {}

  @Get('properties/:propertyId/units')
  @ApiOperation({ summary: 'List units by property with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated units list with filters',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  findAllByProperty(
    @Param('propertyId') propertyId: string,
    @Query() queryDto: QueryUnitsDto,
  ) {
    return this.unitsService.findAllByProperty(propertyId, queryDto);
  }

  @Get('units/:id')
  @ApiOperation({ summary: 'Get unit by ID with full details' })
  @ApiResponse({ status: 200, description: 'Unit details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post('properties/:propertyId/units')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new unit for property (admin only)' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  create(
    @Param('propertyId') propertyId: string,
    @Body() createUnitDto: CreateUnitDto,
  ) {
    createUnitDto.propertyId = propertyId;
    return this.unitsService.create(createUnitDto);
  }

  @Post('properties/:propertyId/units/batch')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Batch create units for property (admin only)' })
  @ApiResponse({ status: 201, description: 'Units batch created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  batchCreate(
    @Param('propertyId') propertyId: string,
    @Body() batchDto: BatchCreateUnitsDto,
  ) {
    return this.unitsService.batchCreate(propertyId, batchDto);
  }

  @Patch('units/:id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update unit details (admin only)' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Patch('units/:id/archive')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Archive unit (admin only)' })
  @ApiResponse({ status: 200, description: 'Unit archived successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  archive(@Param('id') id: string) {
    return this.unitsService.archive(id);
  }
}
