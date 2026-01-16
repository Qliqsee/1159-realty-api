import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TrafficSource } from '../../common/enums';

export class LeadItemDto {
  @ApiProperty({
    example: 'lead@example.com',
    description: 'Lead email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Lead first name',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Lead last name',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Lead phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    example: 'agent@company.com',
    description: 'Agent email to assign this lead to',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  agentEmail?: string;

  @ApiProperty({
    enum: TrafficSource,
    example: TrafficSource.INSTAGRAM,
    description: 'Traffic source',
    required: false,
  })
  @IsOptional()
  @IsEnum(TrafficSource)
  source?: TrafficSource;
}

export class BatchCreateLeadsDto {
  @ApiProperty({
    type: [LeadItemDto],
    description: 'Array of leads to create',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadItemDto)
  leads: LeadItemDto[];
}
