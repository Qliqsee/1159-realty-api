import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { EnrollmentStatus } from '@prisma/client';

export class ListPartnerClientsQueryDto {
  @ApiPropertyOptional({ description: 'Search by client name or email', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: EnrollmentStatus, description: 'Filter by enrollment status' })
  @IsOptional()
  @IsEnum(EnrollmentStatus)
  enrollmentStatus?: EnrollmentStatus;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '20', default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}
