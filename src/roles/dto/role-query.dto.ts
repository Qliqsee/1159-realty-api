import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RoleQueryDto {
  @ApiPropertyOptional({ description: 'Search by role name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by app context' })
  @IsString()
  @IsOptional()
  appContext?: string;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}
