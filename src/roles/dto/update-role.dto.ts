import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'agent' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'realty' })
  @IsString()
  @IsOptional()
  appContext?: string;

  @ApiPropertyOptional({ example: 'Sales agent role' })
  @IsString()
  @IsOptional()
  description?: string;
}
