import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommissionStatus, CommissionType } from './query-commissions.dto';

export class CommissionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  invoiceId: string;

  @ApiPropertyOptional()
  agentId?: string;

  @ApiPropertyOptional()
  agentName?: string;

  @ApiPropertyOptional()
  partnerId?: string;

  @ApiPropertyOptional()
  partnerName?: string;

  @ApiProperty({ enum: CommissionType })
  type: CommissionType;

  @ApiProperty()
  percentage: number;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: CommissionStatus })
  status: CommissionStatus;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiProperty()
  enrollmentDetails: {
    id: string;
    propertyName: string;
    clientName?: string;
    totalAmount: number;
  };

  @ApiProperty()
  invoiceDetails: {
    id: string;
    installmentNumber: number;
    amount: number;
    paidAt?: Date;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CommissionStatsDto {
  @ApiProperty()
  totalCommissions: number;

  @ApiProperty()
  pendingCommissions: number;

  @ApiProperty()
  paidCommissions: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  pendingAmount: number;

  @ApiProperty()
  paidAmount: number;
}
