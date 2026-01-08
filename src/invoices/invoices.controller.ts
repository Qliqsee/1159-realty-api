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

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'client')
  @ApiOperation({
    summary: 'Get invoice by ID (admin/agent/client)',
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
}
