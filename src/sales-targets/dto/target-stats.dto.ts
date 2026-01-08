import { ApiProperty } from '@nestjs/swagger';

export class TargetStatsDto {
  @ApiProperty({ description: 'Total number of targets' })
  totalTargets: number;

  @ApiProperty({ description: 'Number of active targets' })
  activeTargets: number;

  @ApiProperty({ description: 'Number of completed targets' })
  completedTargets: number;

  @ApiProperty({ description: 'Number of achieved targets (100% or more)' })
  achievedTargets: number;

  @ApiProperty({ description: 'Number of pending targets (less than 100%)' })
  pendingTargets: number;

  @ApiProperty({ description: 'Total target amount' })
  totalTargetAmount: number;

  @ApiProperty({ description: 'Total achieved amount' })
  totalAchievedAmount: number;

  @ApiProperty({ description: 'Overall achievement percentage' })
  overallAchievementPercentage: number;
}
