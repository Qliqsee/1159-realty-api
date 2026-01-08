import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from './query-invoices.dto';

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  installmentNumber: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty({ enum: InvoiceStatus })
  status: InvoiceStatus;

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

  @ApiProperty()
  propertyName: string;

  @ApiPropertyOptional()
  clientName?: string;

  @ApiPropertyOptional()
  clientEmail?: string;

  @ApiProperty()
  agentName: string;

  @ApiPropertyOptional()
  partnerName?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class InvoiceDetailResponseDto extends InvoiceResponseDto {
  @ApiProperty()
  enrollment: {
    id: string;
    propertyId: string;
    propertyName: string;
    agentId: string;
    agentName: string;
    clientId?: string;
    clientName?: string;
    totalAmount: number;
    amountPaid: number;
    status: string;
  };

  @ApiPropertyOptional()
  paymentHistory?: Array<{
    amount: number;
    paidAt: Date;
    reference: string;
  }>;
}
