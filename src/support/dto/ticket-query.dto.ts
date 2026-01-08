import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TicketStatus {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  PROPERTY = 'PROPERTY',
  ENROLLMENT = 'ENROLLMENT',
  KYC = 'KYC',
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export class TicketQueryDto {
  @ApiProperty({
    example: 1,
    description: 'Page number',
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    example: 20,
    description: 'Items per page',
    required: false,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

  @ApiProperty({
    example: 'dashboard',
    description: 'Search by reason',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 'OPENED',
    description: 'Filter by status',
    enum: TicketStatus,
    required: false,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiProperty({
    example: 'TECHNICAL',
    description: 'Filter by category',
    enum: TicketCategory,
    required: false,
  })
  @IsEnum(TicketCategory)
  @IsOptional()
  category?: TicketCategory;

  @ApiProperty({
    example: 'uuid-here',
    description: 'Filter by user ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;
}
