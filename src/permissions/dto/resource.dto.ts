import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateResourceDto {
  @ApiProperty({ example: 'leads' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Leads management resource' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateResourceDto {
  @ApiPropertyOptional({ example: 'leads' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ResourceQueryDto {
  @ApiPropertyOptional({ example: 'leads' })
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
