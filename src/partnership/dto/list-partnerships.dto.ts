import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PartnershipStatus } from '@prisma/client';
import { PartnershipWithUserDto } from './partnership-response.dto';

export class ListPartnershipsQueryDto {
  @ApiPropertyOptional({ description: 'Search by user name or email', example: 'john' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PartnershipStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(PartnershipStatus)
  status?: PartnershipStatus;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '20', default: '20' })
  @IsOptional()
  @IsString()
  limit?: string;
}

export class ListPartnershipsResponseDto {
  @ApiProperty({ type: [PartnershipWithUserDto] })
  data: PartnershipWithUserDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
