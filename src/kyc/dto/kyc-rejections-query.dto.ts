import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsDateString } from 'class-validator';

export class KycRejectionsQueryDto {
  @ApiProperty({ required: false, description: 'Search in rejection reasons' })
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, description: 'Filter by creation date from' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({ required: false, description: 'Filter by creation date to' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
