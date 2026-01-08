import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateSegmentDto {
  @ApiProperty({
    description: 'Name of the segment',
    example: 'Lagos Male Property Buyers',
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    description: 'Description of the segment',
    example: 'All male users who have enrolled in properties located in Lagos',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Filter by gender',
    example: ['MALE', 'FEMALE'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gender?: string[];

  @ApiProperty({
    description: 'Filter by property IDs (users enrolled in these properties)',
    example: ['prop-uuid-1', 'prop-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  properties?: string[];

  @ApiProperty({
    description: 'Filter by countries',
    example: ['Nigeria', 'Ghana'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  countries?: string[];

  @ApiProperty({
    description: 'Filter by states',
    example: ['Lagos', 'Abuja'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  states?: string[];

  @ApiProperty({
    description: 'Filter by traffic sources',
    example: ['Google Ads', 'Facebook', 'Instagram'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trafficSources?: string[];

  @ApiProperty({
    description: 'Filter by agent IDs',
    example: ['agent-uuid-1', 'agent-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  agentIds?: string[];

  @ApiProperty({
    description: 'Filter by partner IDs',
    example: ['partner-uuid-1', 'partner-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  partnerIds?: string[];

  @ValidateIf((o: CreateSegmentDto) => {
    return (
      !o.gender?.length &&
      !o.properties?.length &&
      !o.countries?.length &&
      !o.states?.length &&
      !o.trafficSources?.length &&
      !o.agentIds?.length &&
      !o.partnerIds?.length
    );
  })
  @ArrayMinSize(1, {
    message: 'At least one filter criteria must be provided',
  })
  _atLeastOneCriteria?: any[];
}
