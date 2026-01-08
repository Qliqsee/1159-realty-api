import { ApiProperty } from '@nestjs/swagger';

export class TargetAchievementDto {
  @ApiProperty({ description: 'Achievement ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Target amount' })
  targetAmount: number;

  @ApiProperty({ description: 'Achieved amount' })
  achievedAmount: number;

  @ApiProperty({ description: 'Achievement percentage' })
  achievementPercentage: number;

  @ApiProperty({ description: 'Start date' })
  startDate: string;

  @ApiProperty({ description: 'End date' })
  endDate: string;

  @ApiProperty({ description: 'Achieved at' })
  achievedAt: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;
}
