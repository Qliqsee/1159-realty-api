import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';

export class PartnerClientDto {
  @ApiProperty({ example: 'client123' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 2 })
  totalEnrollments: number;

  @ApiProperty({ example: 1 })
  activeEnrollments: number;

  @ApiProperty({ example: 150000 })
  totalRevenue: number;

  @ApiProperty({ example: 4500 })
  totalCommissions: number;

  @ApiProperty({ example: 3000 })
  paidCommissions: number;

  @ApiProperty({ example: 1500 })
  pendingCommissions: number;
}

export class ListPartnerClientsResponseDto {
  @ApiProperty({ type: [PartnerClientDto] })
  data: PartnerClientDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class EnrollmentSummaryDto {
  @ApiProperty({ example: 'enrollment123' })
  id: string;

  @ApiProperty({ example: 'Palm Gardens Estate' })
  propertyName: string;

  @ApiProperty({ enum: EnrollmentStatus, example: EnrollmentStatus.ONGOING })
  status: EnrollmentStatus;

  @ApiProperty({ example: 5000000 })
  totalAmount: number;

  @ApiProperty({ example: 2000000 })
  amountPaid: number;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  enrollmentDate: Date;
}

export class CommissionSummaryDto {
  @ApiProperty({ example: 'commission123' })
  id: string;

  @ApiProperty({ example: 'enrollment123' })
  enrollmentId: string;

  @ApiProperty({ example: 150000 })
  amount: number;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00.000Z' })
  paidAt?: Date;
}

export class PartnerClientDetailDto {
  @ApiProperty({ example: 'client123' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: [EnrollmentSummaryDto] })
  enrollments: EnrollmentSummaryDto[];

  @ApiProperty({ type: [CommissionSummaryDto] })
  commissions: CommissionSummaryDto[];

  @ApiProperty({ example: 150000 })
  totalRevenue: number;

  @ApiProperty({ example: 4500 })
  totalCommissions: number;

  @ApiProperty({ example: 3000 })
  paidCommissions: number;

  @ApiProperty({ example: 1500 })
  pendingCommissions: number;
}
