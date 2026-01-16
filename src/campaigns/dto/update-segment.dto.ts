import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateSegmentDto {
  @ApiProperty({
    description: 'Name of the segment',
    example: 'Lagos Male Property Buyers',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiProperty({
    description: 'Description of the segment',
    example: 'All male users who have enrolled in properties located in Lagos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
