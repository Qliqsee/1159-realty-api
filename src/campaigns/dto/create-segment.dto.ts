import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ArrayMinSize,
  MinLength,
  ValidateIf,
  IsEnum,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrafficSource, Gender, Country, MatchType } from '../../common/enums';

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
    description: 'Criteria matching logic: ALL (users must match all criteria) or ANY (users can match any criteria)',
    example: MatchType.ALL,
    enum: MatchType,
    default: MatchType.ALL,
  })
  @IsEnum(MatchType)
  matchType: MatchType = MatchType.ALL;

  @ApiProperty({
    description: 'Filter by gender',
    example: [Gender.MALE, Gender.FEMALE],
    required: false,
    enum: Gender,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Gender, { each: true })
  gender?: Gender[];

  @ApiProperty({
    description: 'Filter by property IDs (users enrolled in these properties)',
    example: ['prop-uuid-1', 'prop-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  properties?: string[];

  @ApiProperty({
    description: 'Filter by countries',
    example: [Country.NIGERIA, Country.OTHERS],
    required: false,
    enum: Country,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Country, { each: true })
  countries?: Country[];

  @ApiProperty({
    description: 'Filter by state IDs',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  states?: number[];

  @ApiProperty({
    description: 'Filter by traffic sources',
    example: [TrafficSource.INSTAGRAM, TrafficSource.REFERRAL],
    required: false,
    enum: TrafficSource,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(TrafficSource, { each: true })
  trafficSources?: TrafficSource[];

  @ApiProperty({
    description: 'Filter by agent IDs',
    example: ['agent-uuid-1', 'agent-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  agentIds?: string[];

  @ApiProperty({
    description: 'Filter by partner IDs',
    example: ['partner-uuid-1', 'partner-uuid-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  partnerIds?: string[];

  @ApiProperty({
    description: 'Filter by minimum total amount spent (in enrollments)',
    example: 5000000,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minTotalSpent?: number;

  @ApiProperty({
    description: 'Filter by maximum total amount spent (in enrollments)',
    example: 50000000,
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxTotalSpent?: number;

  @ValidateIf((o: CreateSegmentDto) => {
    return (
      !o.gender?.length &&
      !o.properties?.length &&
      !o.countries?.length &&
      !o.states?.length &&
      !o.trafficSources?.length &&
      !o.agentIds?.length &&
      !o.partnerIds?.length &&
      o.minTotalSpent === undefined &&
      o.maxTotalSpent === undefined
    );
  })
  @ArrayMinSize(1, {
    message: 'At least one filter criteria must be provided',
  })
  _atLeastOneCriteria?: any[];
}
