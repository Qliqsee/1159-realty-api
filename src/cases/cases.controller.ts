import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { CaseQueryDto } from './dto/case-query.dto';
import { MyCasesQueryDto } from './dto/my-cases-query.dto';
import { CaseResponseDto } from './dto/case-response.dto';
import { PaginatedCaseResponseDto } from './dto/paginated-case-response.dto';
import { CaseStatsResponseDto } from './dto/case-stats-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';

@ApiTags('Cases Management')
@ApiBearerAuth('JWT-auth')
@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Create a new case (Admin only)' })
  @ApiResponse({ status: 201, description: 'Case created successfully', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Get all cases with pagination, search, and filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated cases list', type: PaginatedCaseResponseDto })
  findAll(@Query() query: CaseQueryDto) {
    return this.casesService.findAll(query);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Get case statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns case statistics', type: CaseStatsResponseDto })
  getStats() {
    return this.casesService.getStats();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my cases (Client)' })
  @ApiResponse({ status: 200, description: 'Returns paginated cases list for logged-in user', type: PaginatedCaseResponseDto })
  getMyCases(@Request() req, @Query() query: MyCasesQueryDto) {
    return this.casesService.getMyCases(req.user.clientId, query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Get single case details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns case details', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Update case (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case updated successfully', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Update case status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case status updated successfully', type: CaseResponseDto })
  @ApiResponse({ status: 404, description: 'Case not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateCaseStatusDto: UpdateCaseStatusDto,
  ) {
    return this.casesService.updateStatus(id, updateCaseStatusDto);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Delete case (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
