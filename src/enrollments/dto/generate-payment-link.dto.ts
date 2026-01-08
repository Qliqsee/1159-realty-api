import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GeneratePaymentLinkDto {
  @ApiPropertyOptional({ description: 'First name (required if no client linked)' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name (required if no client linked)' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Invoice ID to generate payment link for (defaults to first unpaid invoice)' })
  @IsUUID()
  @IsOptional()
  invoiceId?: string;
}

export class PaymentLinkResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  paymentUrl: string;

  @ApiProperty()
  expiresAt: Date;

  @ApiProperty()
  enrollmentId: string;

  @ApiProperty()
  invoiceId: string;
}
