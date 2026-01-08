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

export enum EnrollmentStatus {
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  SUSPENDED = 'SUSPENDED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentType {
  INSTALLMENT = 'INSTALLMENT',
  OUTRIGHT = 'OUTRIGHT',
}

export enum EnrollmentSortBy {
  CREATED_AT = 'createdAt',
  ENROLLMENT_DATE = 'enrollmentDate',
  TOTAL_AMOUNT = 'totalAmount',
  AMOUNT_PAID = 'amountPaid',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryEnrollmentsDto {
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

  @ApiPropertyOptional({ enum: EnrollmentStatus, description: 'Filter by enrollment status' })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Filter by agent ID' })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Filter by client ID' })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({ enum: PaymentType, description: 'Filter by payment type' })
  @IsEnum(PaymentType)
  @IsOptional()
  paymentType?: PaymentType;

  @ApiPropertyOptional({ description: 'Filter by enrollment date from (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  enrollmentDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by enrollment date to (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  enrollmentDateTo?: string;

  @ApiPropertyOptional({ description: 'Search by client name/email, property name, enrollment ID' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: EnrollmentSortBy, description: 'Sort field' })
  @IsEnum(EnrollmentSortBy)
  @IsOptional()
  sortBy?: EnrollmentSortBy = EnrollmentSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;
}
