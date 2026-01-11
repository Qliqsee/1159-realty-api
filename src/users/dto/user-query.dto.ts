import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum UserSortOption {
  LATEST = 'latest',
  OLDEST = 'oldest',
  MOST_SPENT = 'most_spent',
}

export class UserQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status' })
  @IsString()
  @IsOptional()
  emailVerified?: string;

  @ApiPropertyOptional({ description: 'Exclude clients from results' })
  @IsString()
  @IsOptional()
  excludeClient?: string;

  @ApiPropertyOptional({ description: 'Exclude partners from results' })
  @IsString()
  @IsOptional()
  excludePartners?: string;

  @ApiPropertyOptional({ description: 'Exclude admins from results' })
  @IsString()
  @IsOptional()
  excludeAdmin?: string;

  @ApiPropertyOptional({ description: 'Filter by gender', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by KYC completion' })
  @IsString()
  @IsOptional()
  hasCompletedKYC?: string;

  @ApiPropertyOptional({ description: 'Filter by suspension status' })
  @IsString()
  @IsOptional()
  isSuspended?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: UserSortOption,
    default: 'latest'
  })
  @IsEnum(UserSortOption)
  @IsOptional()
  sort?: UserSortOption;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}

export class MyClientsQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Exclude agents from results' })
  @IsString()
  @IsOptional()
  excludeAgents?: string;

  @ApiPropertyOptional({ description: 'Exclude partners from results' })
  @IsString()
  @IsOptional()
  excludePartners?: string;

  @ApiPropertyOptional({ description: 'Filter by gender', enum: ['MALE', 'FEMALE', 'PREFER_NOT_TO_SAY'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by KYC completion' })
  @IsString()
  @IsOptional()
  hasCompletedKYC?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: UserSortOption,
    default: 'latest'
  })
  @IsEnum(UserSortOption)
  @IsOptional()
  sort?: UserSortOption;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}
