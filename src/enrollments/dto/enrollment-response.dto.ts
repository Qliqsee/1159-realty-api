import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentStatus, PaymentType } from '@prisma/client';

export class EnrollmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  propertyName: string;

  @ApiPropertyOptional()
  unitId?: string;

  @ApiPropertyOptional()
  unitNumber?: string;

  @ApiProperty()
  agentId: string;

  @ApiProperty()
  agentName: string;

  @ApiPropertyOptional()
  clientId?: string;

  @ApiPropertyOptional()
  clientName?: string;

  @ApiPropertyOptional()
  clientEmail?: string;

  @ApiPropertyOptional()
  partnerId?: string;

  @ApiPropertyOptional()
  partnerName?: string;

  @ApiProperty({ enum: PaymentType })
  paymentType: PaymentType;

  @ApiPropertyOptional()
  selectedPaymentPlanId?: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty({ enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty()
  gracePeriodDaysUsed: number;

  @ApiProperty()
  enrollmentDate: Date;

  @ApiProperty()
  totalInstallments: number;

  @ApiProperty()
  paidInstallments: number;

  @ApiProperty()
  overdueInstallments: number;

  @ApiProperty()
  pendingInstallments: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
