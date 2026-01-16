import { ApiProperty } from '@nestjs/swagger';
import { MatchType, SegmentStatus } from '../../common/enums';
import { SegmentConditionsDto } from './segment-conditions.dto';

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

  @ApiProperty({
    description: 'Segment filtering conditions',
    type: SegmentConditionsDto,
    example: {
      gender: ['MALE'],
      properties: ['prop-uuid-1'],
      countries: ['NIGERIA'],
      states: [1, 2],
      trafficSources: ['INSTAGRAM', 'REFERRAL'],
      agentIds: ['agent-uuid-1'],
      partnerIds: ['partner-uuid-1'],
      minTotalSpent: 5000000,
      maxTotalSpent: 50000000,
    },
  })
  conditions: SegmentConditionsDto;

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
