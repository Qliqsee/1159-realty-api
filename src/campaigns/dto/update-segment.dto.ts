import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateSegmentDto {
  @ApiProperty({
    description: 'Name of the segment',
    example: 'Male only',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Description of the segment',
    example: 'All male users',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
