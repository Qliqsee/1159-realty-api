import { ApiProperty } from '@nestjs/swagger';
import { TrafficSource, Gender, Country, MatchType, SegmentStatus } from '../../common/enums';

class SegmentCreatorDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;
}

export class SegmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Lagos Male Property Buyers' })
  name: string;

  @ApiProperty({
    example: 'All male users who have enrolled in properties located in Lagos',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: MatchType.ALL, enum: MatchType })
  matchType: MatchType;

  @ApiProperty({ example: SegmentStatus.CREATED, enum: SegmentStatus })
  status: SegmentStatus;

  @ApiProperty({ example: [Gender.MALE], enum: Gender, isArray: true })
  gender: Gender[];

  @ApiProperty({ example: ['prop-uuid-1'], type: [String] })
  properties: string[];

  @ApiProperty({ example: [Country.NIGERIA], enum: Country, isArray: true })
  countries: Country[];

  @ApiProperty({ example: [1, 2], type: [Number] })
  states: number[];

  @ApiProperty({ example: [TrafficSource.INSTAGRAM, TrafficSource.REFERRAL], enum: TrafficSource, isArray: true })
  trafficSources: TrafficSource[];

  @ApiProperty({ example: ['agent-uuid-1'], type: [String] })
  agentIds: string[];

  @ApiProperty({ example: ['partner-uuid-1'], type: [String] })
  partnerIds: string[];

  @ApiProperty({ example: 5000000, required: false, type: Number })
  minTotalSpent?: number;

  @ApiProperty({ example: 50000000, required: false, type: Number })
  maxTotalSpent?: number;

  @ApiProperty({ example: 'brevo-list-id-123', required: false })
  brevoListId?: string;

  @ApiProperty({ example: 1234, description: 'Total number of clients matching this segment' })
  clientsCount: number;

  @ApiProperty({ type: SegmentCreatorDto })
  creator: SegmentCreatorDto;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  updatedAt: Date;
}
