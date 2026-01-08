import { ApiProperty } from '@nestjs/swagger';

export class MonthlyRevenueDto {
  @ApiProperty({ example: '2024-01' })
  month: string;

  @ApiProperty({ example: 25000 })
  revenue: number;

  @ApiProperty({ example: 750 })
  commissions: number;
}

export class PartnerDashboardDto {
  @ApiProperty({ example: 15 })
  totalClients: number;

  @ApiProperty({ example: 30 })
  totalEnrollments: number;

  @ApiProperty({ example: 20 })
  activeEnrollments: number;

  @ApiProperty({ example: 10 })
  completedEnrollments: number;

  @ApiProperty({ example: 500000 })
  totalRevenue: number;

  @ApiProperty({ example: 15000 })
  totalCommissionsEarned: number;

  @ApiProperty({ example: 10000 })
  paidCommissions: number;

  @ApiProperty({ example: 5000 })
  pendingCommissions: number;

  @ApiProperty({ type: [MonthlyRevenueDto] })
  monthlyRevenue: MonthlyRevenueDto[];

  @ApiProperty({ example: 3 })
  newClientsThisMonth: number;

  @ApiProperty({ example: 5 })
  newEnrollmentsThisMonth: number;
}
