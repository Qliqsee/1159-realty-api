import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentStatsDto {
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
}
