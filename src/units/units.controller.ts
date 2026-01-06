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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
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
  findAllByProperty(
    @Param('propertyId') propertyId: string,
    @Query() queryDto: QueryUnitsDto,
  ) {
    return this.unitsService.findAllByProperty(propertyId, queryDto);
  }

  @Get('units/:id')
  findOne(@Param('id') id: string) {
    return this.unitsService.findOne(id);
  }

  @Post('properties/:propertyId/units')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  update(@Param('id') id: string, @Body() updateUnitDto: UpdateUnitDto) {
    return this.unitsService.update(id, updateUnitDto);
  }

  @Patch('units/:id/archive')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  archive(@Param('id') id: string) {
    return this.unitsService.archive(id);
  }
}
