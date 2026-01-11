import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySchedulesDto {
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

  @ApiProperty({ description: 'Search by location', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by property ID', required: false })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty({ description: 'Filter by creator user ID', required: false })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ description: 'Filter by date/time from', required: false })
  @IsOptional()
  @IsDateString()
  dateTimeFrom?: string;

  @ApiProperty({ description: 'Filter by date/time to', required: false })
  @IsOptional()
  @IsDateString()
  dateTimeTo?: string;

  @ApiProperty({ description: 'Filter upcoming schedules only', required: false })
  @IsOptional()
  @Type(() => Boolean)
  upcomingOnly?: boolean;
}
