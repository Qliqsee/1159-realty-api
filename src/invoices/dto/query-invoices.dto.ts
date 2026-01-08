import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceSortBy {
  CREATED_AT = 'createdAt',
  DUE_DATE = 'dueDate',
  AMOUNT = 'amount',
  AMOUNT_PAID = 'amountPaid',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryInvoicesDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ enum: InvoiceStatus, description: 'Filter by invoice status' })
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatus;

  @ApiPropertyOptional({ description: 'Filter by enrollment ID' })
  @IsUUID()
  @IsOptional()
  enrollmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Filter by partner ID' })
  @IsUUID()
  @IsOptional()
  partnerId?: string;

  @ApiPropertyOptional({ description: 'Filter by due date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by due date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @ApiPropertyOptional({ description: 'Filter only overdue invoices' })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  overdue?: boolean;

  @ApiPropertyOptional({ description: 'Search by enrollment ID, client name, invoice ID' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: InvoiceSortBy, description: 'Sort field' })
  @IsEnum(InvoiceSortBy)
  @IsOptional()
  sortBy?: InvoiceSortBy = InvoiceSortBy.DUE_DATE;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
