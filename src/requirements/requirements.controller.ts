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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto } from './dto/create-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';
import { ApproveDocumentDto } from './dto/approve-document.dto';
import { RejectDocumentDto } from './dto/reject-document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Requirements Management')
@ApiBearerAuth('JWT-auth')
@Controller('requirements')
@UseGuards(JwtAuthGuard)
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post('cases/:caseId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add requirement to case (Admin only)' })
  @ApiResponse({ status: 201, description: 'Requirement created successfully' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  create(
    @Param('caseId') caseId: string,
    @Body() createRequirementDto: CreateRequirementDto,
  ) {
    return this.requirementsService.create(caseId, createRequirementDto);
  }

  @Get('cases/:caseId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all requirements for a case (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns requirements list' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  findAll(@Param('caseId') caseId: string) {
    return this.requirementsService.findAll(caseId);
  }

  @Get('my/cases/:caseId')
  @ApiOperation({ summary: 'Get my requirements for a case (Client)' })
  @ApiResponse({ status: 200, description: 'Returns requirements list' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  getMyRequirements(@Param('caseId') caseId: string, @Request() req) {
    return this.requirementsService.getMyRequirements(caseId, req.user.id);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get requirement detail (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns requirement details' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement updated successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  update(
    @Param('id') id: string,
    @Body() updateRequirementDto: UpdateRequirementDto,
  ) {
    return this.requirementsService.update(id, updateRequirementDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Requirement deleted successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id);
  }

  @Post(':id/samples')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload sample document (Admin only)' })
  @ApiResponse({ status: 201, description: 'Sample document uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  uploadSample(
    @Param('id') requirementId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.requirementsService.uploadSample(requirementId, file);
  }

  @Delete('samples/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete sample document (Admin only)' })
  @ApiResponse({ status: 200, description: 'Sample document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Sample document not found' })
  deleteSample(@Param('id') sampleId: string) {
    return this.requirementsService.deleteSample(sampleId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload document for requirement (Client)' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  uploadDocument(
    @Param('id') requirementId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.requirementsService.uploadDocument(
      requirementId,
      req.user.id,
      file,
    );
  }

  @Get(':id/my-documents')
  @ApiOperation({ summary: 'Get my documents for requirement (Client)' })
  @ApiResponse({ status: 200, description: 'Returns my documents list' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  getMyDocuments(@Param('id') requirementId: string, @Request() req) {
    return this.requirementsService.getMyDocuments(requirementId, req.user.id);
  }

  @Patch('documents/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Approve document (Admin only)' })
  @ApiResponse({ status: 200, description: 'Document approved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  approveDocument(
    @Param('id') documentId: string,
    @Request() req,
    @Body() approveDocumentDto: ApproveDocumentDto,
  ) {
    return this.requirementsService.approveDocument(documentId, req.user.id);
  }

  @Patch('documents/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Reject document (Admin only)' })
  @ApiResponse({ status: 200, description: 'Document rejected successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  rejectDocument(
    @Param('id') documentId: string,
    @Body() rejectDocumentDto: RejectDocumentDto,
    @Request() req,
  ) {
    return this.requirementsService.rejectDocument(
      documentId,
      rejectDocumentDto,
      req.user.id,
    );
  }

  @Get(':id/documents/stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get document statistics for requirement (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns document statistics' })
  @ApiResponse({ status: 404, description: 'Requirement not found' })
  getDocumentStats(@Param('id') requirementId: string) {
    return this.requirementsService.getDocumentStats(requirementId);
  }
}
