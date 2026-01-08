import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class InvoiceStatsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Filter by partner ID' })
  @IsUUID()
  @IsOptional()
  partnerId?: string;
}

export class InvoiceStatsResponseDto {
  @ApiProperty({ description: 'Total number of invoices' })
  totalInvoices: number;

  @ApiProperty({ description: 'Total pending invoices' })
  totalPending: number;

  @ApiProperty({ description: 'Total paid invoices' })
  totalPaid: number;

  @ApiProperty({ description: 'Total overdue invoices' })
  totalOverdue: number;

  @ApiProperty({ description: 'Total cancelled invoices' })
  totalCancelled: number;

  @ApiProperty({ description: 'Total amount generated (all-time)' })
  totalAmountGenerated: number;

  @ApiProperty({ description: 'Total amount pending' })
  totalAmountPending: number;

  @ApiProperty({ description: 'Total amount paid' })
  totalAmountPaid: number;

  @ApiProperty({ description: 'Total amount overdue' })
  totalAmountOverdue: number;

  @ApiPropertyOptional({ description: 'Revenue breakdown by time period' })
  revenueBreakdown?: {
    property?: string;
    agent?: string;
    partner?: string;
    totalRevenue: number;
    paidRevenue: number;
    pendingRevenue: number;
  };
}
