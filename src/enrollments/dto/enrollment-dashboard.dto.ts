import { ApiProperty } from '@nestjs/swagger';

export class MonthlyTrendDto {
  @ApiProperty({ description: 'Month (YYYY-MM format)' })
  month: string;

  @ApiProperty({ description: 'Number of enrollments in this month' })
  enrollments: number;

  @ApiProperty({ description: 'Revenue collected in this month' })
  revenue: number;

  @ApiProperty({ description: 'Commissions earned in this month' })
  commissions: number;
}

export class EnrollmentDashboardDto {
  @ApiProperty({ description: 'Total number of enrollments' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Number of ongoing enrollments' })
  ongoingEnrollments: number;

  @ApiProperty({ description: 'Number of completed enrollments' })
  completedEnrollments: number;

  @ApiProperty({ description: 'Number of suspended enrollments' })
  suspendedEnrollments: number;

  @ApiProperty({ description: 'Number of cancelled enrollments' })
  cancelledEnrollments: number;

  @ApiProperty({ description: 'Total revenue from all enrollments' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total revenue collected (paid)' })
  collectedRevenue: number;

  @ApiProperty({ description: 'Pending revenue (unpaid)' })
  pendingRevenue: number;

  @ApiProperty({ description: 'Total commissions earned' })
  totalCommissions: number;

  @ApiProperty({ description: 'Commissions paid to agent/partner' })
  paidCommissions: number;

  @ApiProperty({ description: 'Pending commissions' })
  pendingCommissions: number;

  @ApiProperty({ description: 'Monthly trends data', type: [MonthlyTrendDto] })
  monthlyTrends: MonthlyTrendDto[];

  @ApiProperty({ description: 'Conversion rate from property interests (if available)' })
  conversionRate?: number;

  @ApiProperty({ description: 'Average enrollment value' })
  averageEnrollmentValue: number;
}
