import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum AdminSortOption {
  LATEST = 'latest',
  OLDEST = 'oldest',
}

export class AdminQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsString()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by suspension status' })
  @IsString()
  @IsOptional()
  isSuspended?: string;

  @ApiPropertyOptional({ description: 'Filter by ban status' })
  @IsString()
  @IsOptional()
  isBanned?: string;

  @ApiPropertyOptional({ description: 'Filter by onboarding capability' })
  @IsString()
  @IsOptional()
  canOnboardClients?: string;

  @ApiPropertyOptional({ description: 'Filter by country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by state' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: AdminSortOption,
    default: 'latest'
  })
  @IsEnum(AdminSortOption)
  @IsOptional()
  sort?: AdminSortOption;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}

export class ClientQueryDto {
  @ApiPropertyOptional({ description: 'Search by name, email, or phone' })
  @IsString()
  @IsOptional()
  search?: string;

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

  @ApiPropertyOptional({ description: 'Filter by onboarding completion' })
  @IsString()
  @IsOptional()
  hasCompletedOnboarding?: string;

  @ApiPropertyOptional({ description: 'Exclude partners from results' })
  @IsString()
  @IsOptional()
  excludePartners?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: AdminSortOption,
    default: 'latest'
  })
  @IsEnum(AdminSortOption)
  @IsOptional()
  sort?: AdminSortOption;

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

  @ApiPropertyOptional({ description: 'Exclude partners from results' })
  @IsString()
  @IsOptional()
  excludePartners?: string;

  @ApiPropertyOptional({
    description: 'Sort option',
    enum: AdminSortOption,
    default: 'latest'
  })
  @IsEnum(AdminSortOption)
  @IsOptional()
  sort?: AdminSortOption;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  @IsOptional()
  limit?: string;
}
