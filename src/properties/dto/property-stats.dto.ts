import { ApiProperty } from '@nestjs/swagger';

export class PropertyStatsDto {
  @ApiProperty()
  totalProperties: number;

  @ApiProperty()
  totalLand: number;

  @ApiProperty()
  totalApartments: number;

  @ApiProperty()
  totalSoldOut: number;

  @ApiProperty()
  totalAvailable: number;

  @ApiProperty({ nullable: true })
  mostSoldProperty: {
    id: string;
    name: string;
    enrollmentCount: number;
  } | null;

  @ApiProperty()
  totalInterests: number;

  @ApiProperty()
  totalEnrollments: number;

  @ApiProperty()
  activeEnrollments: number;

  @ApiProperty()
  completedEnrollments: number;

  @ApiProperty()
  suspendedEnrollments: number;

  @ApiProperty()
  cancelledEnrollments: number;

  @ApiProperty()
  totalEnrollmentRevenue: number;

  @ApiProperty()
  collectedRevenue: number;

  @ApiProperty()
  pendingRevenue: number;

  @ApiProperty()
  averageEnrollmentValue: number;
}
