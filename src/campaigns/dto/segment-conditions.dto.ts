import { ApiProperty } from '@nestjs/swagger';
import { TrafficSource, Gender, Country } from '../../common/enums';

export class SegmentConditionsDto {
  @ApiProperty({
    description: 'Filter by gender',
    example: [Gender.MALE, Gender.FEMALE],
    required: false,
    enum: Gender,
    isArray: true,
  })
  gender?: Gender[];

  @ApiProperty({
    description: 'Filter by property IDs (users enrolled in these properties)',
    example: ['prop-uuid-1', 'prop-uuid-2'],
    required: false,
    type: [String],
  })
  properties?: string[];

  @ApiProperty({
    description: 'Filter by countries',
    example: [Country.NIGERIA, Country.OTHERS],
    required: false,
    enum: Country,
    isArray: true,
  })
  countries?: Country[];

  @ApiProperty({
    description: 'Filter by state IDs',
    example: [1, 2, 3],
    required: false,
    type: [Number],
  })
  states?: number[];

  @ApiProperty({
    description: 'Filter by traffic sources',
    example: [TrafficSource.INSTAGRAM, TrafficSource.REFERRAL],
    required: false,
    enum: TrafficSource,
    isArray: true,
  })
  trafficSources?: TrafficSource[];

  @ApiProperty({
    description: 'Filter by agent IDs',
    example: ['agent-uuid-1', 'agent-uuid-2'],
    required: false,
    type: [String],
  })
  agentIds?: string[];

  @ApiProperty({
    description: 'Filter by partner IDs',
    example: ['partner-uuid-1', 'partner-uuid-2'],
    required: false,
    type: [String],
  })
  partnerIds?: string[];

  @ApiProperty({
    description: 'Filter by minimum total amount spent (in enrollments)',
    example: 5000000,
    required: false,
    type: Number,
  })
  minTotalSpent?: number;

  @ApiProperty({
    description: 'Filter by maximum total amount spent (in enrollments)',
    example: 50000000,
    required: false,
    type: Number,
  })
  maxTotalSpent?: number;
}
