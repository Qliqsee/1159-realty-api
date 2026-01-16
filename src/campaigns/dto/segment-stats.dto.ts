import { ApiProperty } from '@nestjs/swagger';

export class SegmentStatsDto {
  @ApiProperty({ example: 1250, description: 'Total number of contacts in Brevo' })
  totalContacts: number;

  @ApiProperty({ example: 25, description: 'Total number of segments' })
  totalSegments: number;
}
