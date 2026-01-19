import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsEnum, IsDateString } from 'class-validator';
import { KycStatus } from '@prisma/client';

export class KycHistoryQueryDto {
  @ApiProperty({ required: false, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;

  @ApiProperty({ required: false, description: 'Filter by submission date from' })
  @IsOptional()
  @IsDateString()
  submissionDateFrom?: string;

  @ApiProperty({ required: false, description: 'Filter by submission date to' })
  @IsOptional()
  @IsDateString()
  submissionDateTo?: string;

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
