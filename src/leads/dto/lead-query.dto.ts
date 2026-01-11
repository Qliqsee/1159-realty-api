import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class LeadQueryDto {
  @ApiProperty({
    description: 'Search in email, firstName, lastName, phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: LeadStatus,
    description: 'Filter by lead status',
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({
    description: 'Filter by agent who reserved the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  reservedBy?: string;

  @ApiProperty({
    description: 'Filter by user who added the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  addedBy?: string;

  @ApiProperty({
    description: 'Filter leads created on or after this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Filter leads created on or before this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    example: '1',
    description: 'Page number (default: 1)',
    required: false,
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    example: '10',
    description: 'Items per page (default: 10)',
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
