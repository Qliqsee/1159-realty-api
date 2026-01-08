import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, PaymentType } from '@prisma/client';

export class InvoiceDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  installmentNumber: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  overdueDate?: Date;

  @ApiProperty()
  overdueFee: number;

  @ApiProperty()
  overdueDays: number;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  paymentReference?: string;
}

export class CommissionDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  paidAt?: Date;
}

export class PropertyDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  address: string;
}

export class UserDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class UnitDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  unitId: string;

  @ApiProperty()
  unit: string;

  @ApiProperty()
  feature?: string;
}

export class EnrollmentDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  property: PropertyDetailDto;

  @ApiPropertyOptional()
  unit?: UnitDetailDto;

  @ApiProperty()
  agent: UserDetailDto;

  @ApiPropertyOptional()
  client?: UserDetailDto;

  @ApiPropertyOptional()
  partner?: UserDetailDto;

  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @ApiPropertyOptional()
  paymentPlan?: {
    id: string;
    durationMonths: number;
    interestRate: number;
  };

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  gracePeriodDaysUsed: number;

  @ApiProperty()
  gracePeriodRemaining: number;

  @ApiProperty()
  enrollmentDate: Date;

  @ApiProperty({ type: [InvoiceDetailDto] })
  invoices: InvoiceDetailDto[];

  @ApiPropertyOptional({ type: [CommissionDetailDto], description: 'Only visible to agents/admins' })
  commissions?: CommissionDetailDto[];

  @ApiProperty()
  totalInstallments: number;

  @ApiProperty()
  completedInstallments: number;

  @ApiProperty()
  overdueInstallments: number;

  @ApiProperty()
  pendingInstallments: number;

  @ApiPropertyOptional()
  nextInstallmentDueDate?: Date;

  @ApiPropertyOptional()
  nextInstallmentAmount?: number;

  @ApiPropertyOptional()
  daysUntilNextDue?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancelledBy?: string;

  @ApiPropertyOptional()
  suspendedAt?: Date;

  @ApiPropertyOptional()
  resumedAt?: Date;
}
