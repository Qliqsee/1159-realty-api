import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({
    example: 'John Doe Documentation',
    description: 'Case name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Property Purchase Documentation',
    description: 'Case title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'uuid-here',
    description: 'User ID (client)',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: 'uuid-here',
    description: 'Property ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  propertyId?: string;
}
