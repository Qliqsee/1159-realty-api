import { ApiProperty } from '@nestjs/swagger';

export class SalesTargetResponseDto {
  @ApiProperty({ description: 'Target ID' })
  id: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'User name' })
  userName: string;

  @ApiProperty({ description: 'User email' })
  userEmail: string;

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

  @ApiProperty({ description: 'Is currently active' })
  isActive: boolean;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: string;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: string;
}
