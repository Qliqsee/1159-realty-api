import { ApiProperty } from '@nestjs/swagger';

export class SegmentStatsDto {
  @ApiProperty({ example: 25, description: 'Total number of segments' })
  totalSegments: number;

  @ApiProperty({
    example: 150,
    description: 'Total number of segment syncs/exports',
  })
  totalSyncs: number;

  @ApiProperty({
    example: 5,
    description: 'Number of segments created this month',
  })
  segmentsThisMonth: number;

  @ApiProperty({
    example: 30,
    description: 'Number of syncs this month',
  })
  syncsThisMonth: number;
}
