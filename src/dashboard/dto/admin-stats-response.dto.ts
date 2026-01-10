import { ApiProperty } from '@nestjs/swagger';

class StatWithChange {
  @ApiProperty({ description: 'Current total value' })
  value: number;

  @ApiProperty({ description: 'Change from end of previous month' })
  change: number;
}

export class AdminStatsResponseDto {
  @ApiProperty({
    description: 'Total enrollments with monthly change',
    type: StatWithChange,
  })
  totalEnrollments: StatWithChange;

  @ApiProperty({
    description: 'Total revenue (all-time) with monthly change',
    type: StatWithChange,
  })
  totalRevenue: StatWithChange;

  @ApiProperty({
    description: 'Total leads with monthly change',
    type: StatWithChange,
  })
  totalLeads: StatWithChange;

  @ApiProperty({
    description: 'Sales target with monthly change',
    type: StatWithChange,
  })
  salesTarget: StatWithChange;

  @ApiProperty({
    description: 'Sales achieved with monthly change',
    type: StatWithChange,
  })
  salesAchieved: StatWithChange;

  @ApiProperty({
    description: 'Total partners with monthly change',
    type: StatWithChange,
  })
  totalPartners: StatWithChange;

  @ApiProperty({
    description: 'Total commissions with monthly change',
    type: StatWithChange,
  })
  totalCommissions: StatWithChange;
}
