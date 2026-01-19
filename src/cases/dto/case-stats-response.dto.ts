import { ApiProperty } from '@nestjs/swagger';

export class CaseStatsResponseDto {
  @ApiProperty({ example: 150, description: 'Total number of cases' })
  total: number;

  @ApiProperty({ example: 45, description: 'Number of pending cases' })
  pending: number;

  @ApiProperty({ example: 90, description: 'Number of completed cases' })
  completed: number;

  @ApiProperty({ example: 15, description: 'Number of rejected cases' })
  rejected: number;
}
