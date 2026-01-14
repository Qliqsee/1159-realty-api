import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { FileUploadService } from '../file-upload/file-upload.service';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(
    private readonly supportService: SupportService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachments', 5))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new support ticket (Client)' })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Request() req,
    @Body() createTicketDto: CreateTicketDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let attachmentUrls: string[] = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) =>
        this.fileUploadService.uploadDocument(file, 'support-tickets'),
      );
      const uploadResults = await Promise.all(uploadPromises);
      attachmentUrls = uploadResults.map((result) => result.url);
    }

    return this.supportService.create(req.user.id, {
      ...createTicketDto,
      attachments: attachmentUrls,
    });
  }

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({
    summary:
      'Get all support tickets with pagination, search, and filters (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Returns paginated tickets list' })
  findAll(@Query() query: TicketQueryDto) {
    return this.supportService.findAll(query);
  }

  @Get('stats')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Get support ticket statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns ticket statistics' })
  getStats() {
    return this.supportService.getStats();
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my support tickets (Client)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated tickets list for logged-in user',
  })
  getMy(@Request() req, @Query() query: TicketQueryDto) {
    return this.supportService.getMy(req.user.id, query);
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Get single ticket details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.supportService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(PermissionsGuard)
  @RequirePermission('support', 'manage')
  @ApiOperation({ summary: 'Update ticket status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateTicketStatusDto: UpdateTicketStatusDto,
  ) {
    return this.supportService.updateStatus(id, updateTicketStatusDto);
  }
}
