import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email', example: 'john' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status', example: 'true' })
  @IsString()
  @IsOptional()
  emailVerified?: string;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}
