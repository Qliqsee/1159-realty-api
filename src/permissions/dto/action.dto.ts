import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({ example: 'view' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'View action' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateActionDto {
  @ApiPropertyOptional({ example: 'view' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ActionQueryDto {
  @ApiPropertyOptional({ example: 'view' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ example: '50' })
  @IsString()
  @IsOptional()
  limit?: string;
}
