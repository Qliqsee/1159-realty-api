import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DisbursementType {
  COMMISSION = 'COMMISSION',
  REFUND = 'REFUND',
}

export enum DisbursementStatus {
  PENDING = 'PENDING',
  RELEASED = 'RELEASED',
  FAILED = 'FAILED',
}

export enum RecipientType {
  AGENT = 'AGENT',
  PARTNER = 'PARTNER',
  CLIENT = 'CLIENT',
}

export enum DisbursementSortBy {
  CREATED_AT = 'createdAt',
  AMOUNT = 'amount',
  RELEASE_DATE = 'releaseDate',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryDisbursementsDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ enum: DisbursementType, description: 'Filter by disbursement type' })
  @IsEnum(DisbursementType)
  @IsOptional()
  type?: DisbursementType;

  @ApiPropertyOptional({ enum: DisbursementStatus, description: 'Filter by disbursement status' })
  @IsEnum(DisbursementStatus)
  @IsOptional()
  status?: DisbursementStatus;

  @ApiPropertyOptional({ description: 'Filter by recipient ID' })
  @IsUUID()
  @IsOptional()
  recipientId?: string;

  @ApiPropertyOptional({ enum: RecipientType, description: 'Filter by recipient type' })
  @IsEnum(RecipientType)
  @IsOptional()
  recipientType?: RecipientType;

  @ApiPropertyOptional({ description: 'Filter by enrollment ID' })
  @IsUUID()
  @IsOptional()
  enrollmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Search by recipient name, enrollment ID, property name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: DisbursementSortBy, description: 'Sort field', default: DisbursementSortBy.CREATED_AT })
  @IsEnum(DisbursementSortBy)
  @IsOptional()
  sortBy?: DisbursementSortBy = DisbursementSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order', default: SortOrder.DESC })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
