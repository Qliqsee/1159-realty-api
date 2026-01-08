import { ApiProperty } from '@nestjs/swagger';

export class PaymentLinkResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  installmentNumber: number;

  @ApiProperty()
  propertyName: string;

  @ApiProperty()
  propertyAddress: string;

  @ApiProperty()
  paymentUrl: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ nullable: true })
  expiresAt: Date | null;
}
