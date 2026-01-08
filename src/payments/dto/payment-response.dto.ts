import { ApiProperty } from '@nestjs/swagger';

export class PaymentResponseDto {
  @ApiProperty()
  authorizationUrl: string;

  @ApiProperty()
  accessCode: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  amount: number;
}

export class PaymentVerificationDto {
  @ApiProperty()
  reference: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  paidAt?: Date;
}
