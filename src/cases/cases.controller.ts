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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Cases Management')
@ApiBearerAuth('JWT-auth')
@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new case (Admin only)' })
  @ApiResponse({ status: 201, description: 'Case created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all cases with pagination, search, and filters (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns paginated cases list' })
  findAll(@Query() query: CaseQueryDto) {
    return this.casesService.findAll(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get case statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns case statistics' })
  getStats() {
    return this.casesService.getStats();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my cases (Client)' })
  @ApiResponse({ status: 200, description: 'Returns paginated cases list for logged-in user' })
  getMyCases(@Request() req, @Query() query: CaseQueryDto) {
    return this.casesService.getMyCases(req.user.id, query);
  }

  @Get('my/:id/stats')
  @ApiOperation({ summary: 'Get my case stats (Client)' })
  @ApiResponse({ status: 200, description: 'Returns case statistics for logged-in user' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  getMyCaseStats(@Param('id') id: string, @Request() req) {
    return this.casesService.getMyCaseStats(id, req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get single case details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns case details' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update case (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case updated successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update case status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case status updated successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateCaseStatusDto: UpdateCaseStatusDto,
  ) {
    return this.casesService.updateStatus(id, updateCaseStatusDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete case (Admin only)' })
  @ApiResponse({ status: 200, description: 'Case deleted successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }
}
