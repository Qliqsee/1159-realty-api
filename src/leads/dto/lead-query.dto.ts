import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class LeadQueryDto {
  @ApiProperty({
    example: 'john',
    description: 'Search in email, firstName, lastName, phone',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    enum: LeadStatus,
    example: 'RESERVED',
    description: 'Filter by lead status',
    required: false,
  })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiProperty({
    example: 'user-id-123',
    description: 'Filter by agent who reserved the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  reservedBy?: string;

  @ApiProperty({
    example: 'user-id-456',
    description: 'Filter by user who added the lead',
    required: false,
  })
  @IsOptional()
  @IsString()
  addedBy?: string;

  @ApiProperty({
    example: '2026-01-01T00:00:00.000Z',
    description: 'Filter leads created on or after this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2026-12-31T23:59:59.999Z',
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
