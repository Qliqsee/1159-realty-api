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
    description: 'Client ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({
    example: 'uuid-here',
    description: 'Property ID',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  propertyId?: string;
}
