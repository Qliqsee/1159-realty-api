import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySalesTargetsDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Search by user name or email', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by start date (from)', example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiProperty({ description: 'Filter by start date (to)', example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiProperty({ description: 'Filter by end date (from)', example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  endDateFrom?: string;

  @ApiProperty({ description: 'Filter by end date (to)', example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  endDateTo?: string;

  @ApiProperty({ description: 'Filter by status - active or completed', enum: ['active', 'completed', 'all'], required: false, example: 'active' })
  @IsOptional()
  @IsString()
  status?: string;
}
