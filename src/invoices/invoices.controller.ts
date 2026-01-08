import {
  Controller,
  Get,
  Post,
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
import { InvoicesService } from './invoices.service';
import { QueryInvoicesDto } from './dto/query-invoices.dto';
import { ResolveInvoiceDto } from './dto/resolve-invoice.dto';
import { InvoiceResponseDto, InvoiceDetailResponseDto } from './dto/invoice-response.dto';
import { InvoiceStatsQueryDto, InvoiceStatsResponseDto } from './dto/invoice-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Invoices')
@Controller('invoices')
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all invoices (admin only)',
    description: 'Returns paginated invoices with filters, search, and sorting',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() queryDto: QueryInvoicesDto) {
    return this.invoicesService.findAll(queryDto);
  }

  @Get('my-invoices')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'List own invoices (agent only)',
    description: 'Returns paginated invoices for enrollments where the authenticated agent is assigned',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMyInvoices(@Query() queryDto: QueryInvoicesDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.invoicesService.findAll(queryDto, userId, 'agent');
  }

  @Get('client')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiOperation({
    summary: 'List client invoices (client only)',
    description: 'Returns paginated invoices for enrollments where the authenticated client is linked',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findClientInvoices(@Query() queryDto: QueryInvoicesDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.invoicesService.findAll(queryDto, userId, 'client');
  }

  @Get('partner')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('partner')
  @ApiOperation({
    summary: 'List partner invoices (partner only)',
    description: 'Returns paginated invoices for enrollments where the authenticated partner onboarded the client',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findPartnerInvoices(@Query() queryDto: QueryInvoicesDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.invoicesService.findAll(queryDto, userId, 'partner');
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get invoice statistics (admin only)',
    description: 'Returns invoice statistics including counts by status and revenue breakdown. Supports optional filtering by date range, property, agent, or partner.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice statistics retrieved successfully',
    type: InvoiceStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats(@Query() queryDto: InvoiceStatsQueryDto) {
    return this.invoicesService.getStats(queryDto);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'client', 'partner')
  @ApiOperation({
    summary: 'Get invoice by ID (admin/agent/client/partner)',
    description: 'Returns detailed invoice information with enrollment details and payment history. Access is role-based.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
    type: InvoiceDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;
    return this.invoicesService.findOne(id, userId, userRole);
  }

  @Post(':id/resolve')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Resolve invoice manually (admin only)',
    description: 'Marks invoice as paid with manual payment reference. Validates sequential payment, creates commissions, and updates enrollment status if all invoices are paid. Applies overdue fee if applicable.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice resolved successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invoice already paid or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  resolve(
    @Param('id') id: string,
    @Body() resolveDto: ResolveInvoiceDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.invoicesService.resolve(id, resolveDto, userId);
  }

  @Post(':id/undo')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Undo invoice payment (admin only)',
    description: 'Reverses a paid invoice. Only works for the most recent payment (sequential rule). Updates enrollment status and cancels associated commissions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment undone successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invoice not paid or not the most recent payment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  undoPayment(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.invoicesService.undoPayment(id, userId);
  }

  @Get(':id/download')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'client', 'partner')
  @ApiOperation({
    summary: 'Download invoice as PDF (admin/agent/client/partner)',
    description: 'Generates and downloads a professional PDF invoice. Access is role-based: admin (all), agent (own), client (own), partner (onboarded clients).',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadInvoice(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role;
    const pdfBuffer = await this.invoicesService.downloadInvoice(id, userId, userRole);

    req.res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return req.res.send(pdfBuffer);
  }
}
