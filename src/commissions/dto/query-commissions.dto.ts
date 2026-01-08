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

export enum CommissionStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum CommissionType {
  AGENT = 'AGENT',
  PARTNER = 'PARTNER',
}

export enum CommissionSortBy {
  CREATED_AT = 'createdAt',
  AMOUNT = 'amount',
  DUE_DATE = 'dueDate',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryCommissionsDto {
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

  @ApiPropertyOptional({ enum: CommissionStatus, description: 'Filter by commission status' })
  @IsEnum(CommissionStatus)
  @IsOptional()
  status?: CommissionStatus;

  @ApiPropertyOptional({ enum: CommissionType, description: 'Filter by commission type (AGENT or PARTNER)' })
  @IsEnum(CommissionType)
  @IsOptional()
  type?: CommissionType;

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

  @ApiPropertyOptional({ description: 'Search by enrollment ID, client name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: CommissionSortBy, description: 'Sort field' })
  @IsEnum(CommissionSortBy)
  @IsOptional()
  sortBy?: CommissionSortBy = CommissionSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
