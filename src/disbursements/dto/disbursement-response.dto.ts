import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisbursementResponseDto {
  @ApiProperty({ description: 'Disbursement ID' })
  id: string;

  @ApiProperty({ description: 'Disbursement type', enum: ['COMMISSION', 'REFUND'] })
  type: string;

  @ApiPropertyOptional({ description: 'Commission ID if type is COMMISSION' })
  commissionId?: string;

  @ApiProperty({ description: 'Enrollment ID' })
  enrollmentId: string;

  @ApiProperty({ description: 'Recipient ID' })
  recipientId: string;

  @ApiProperty({ description: 'Recipient type', enum: ['AGENT', 'PARTNER', 'CLIENT'] })
  recipientType: string;

  @ApiProperty({ description: 'Disbursement amount' })
  amount: number;

  @ApiProperty({ description: 'Disbursement status', enum: ['PENDING', 'RELEASED', 'FAILED'] })
  status: string;

  @ApiPropertyOptional({ description: 'Release date' })
  releaseDate?: Date;

  @ApiPropertyOptional({ description: 'Transfer code from Paystack' })
  transferCode?: string;

  @ApiPropertyOptional({ description: 'Transfer reference' })
  transferReference?: string;

  @ApiPropertyOptional({ description: 'Paystack response data' })
  paystackResponse?: any;

  @ApiProperty({ description: 'Recipient details' })
  recipientDetails: {
    id: string;
    name?: string;
    email: string;
  };

  @ApiPropertyOptional({ description: 'Commission details if type is COMMISSION' })
  commissionDetails?: {
    id: string;
    type: string;
    percentage: number;
    amount: number;
  };

  @ApiProperty({ description: 'Enrollment details' })
  enrollmentDetails: {
    id: string;
    propertyName: string;
    clientName?: string;
    totalAmount: number;
  };

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiPropertyOptional({ description: 'Released by user ID' })
  releasedBy?: string;
}

export class DisbursementStatsDto {
  @ApiProperty({ description: 'Total number of disbursements' })
  totalDisbursements: number;

  @ApiProperty({ description: 'Number of pending disbursements' })
  pendingDisbursements: number;

  @ApiProperty({ description: 'Number of released disbursements' })
  releasedDisbursements: number;

  @ApiProperty({ description: 'Number of failed disbursements' })
  failedDisbursements: number;

  @ApiProperty({ description: 'Total disbursement amount' })
  totalAmount: number;

  @ApiProperty({ description: 'Pending disbursement amount' })
  pendingAmount: number;

  @ApiProperty({ description: 'Released disbursement amount' })
  releasedAmount: number;

  @ApiProperty({ description: 'Failed disbursement amount' })
  failedAmount: number;
}
