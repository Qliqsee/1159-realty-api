import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: ['MALE'], type: [String] })
  gender: string[];

  @ApiProperty({ example: ['prop-uuid-1'], type: [String] })
  properties: string[];

  @ApiProperty({ example: ['Nigeria'], type: [String] })
  countries: string[];

  @ApiProperty({ example: ['Lagos'], type: [String] })
  states: string[];

  @ApiProperty({ example: ['Google Ads'], type: [String] })
  trafficSources: string[];

  @ApiProperty({ example: ['agent-uuid-1'], type: [String] })
  agentIds: string[];

  @ApiProperty({ example: ['partner-uuid-1'], type: [String] })
  partnerIds: string[];

  @ApiProperty({ example: 'brevo-list-id-123', required: false })
  brevoListId?: string;

  @ApiProperty({ type: SegmentCreatorDto })
  creator: SegmentCreatorDto;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  updatedAt: Date;
}
