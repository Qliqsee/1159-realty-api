import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'read:leads' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'leads' })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({ example: 'read' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional({ example: 'Permission to read leads' })
  @IsString()
  description?: string;
}

export class AssignPermissionDto {
  @ApiProperty({ description: 'Permission ID to assign', example: 'clx123abc' })
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}

export class PermissionQueryDto {
  @ApiPropertyOptional({ description: 'Search by permission name or resource', example: 'leads' })
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: '1', default: '1' })
  @IsString()
  page?: string;

  @ApiPropertyOptional({ description: 'Items per page', example: '10', default: '10' })
  @IsString()
  limit?: string;
}
