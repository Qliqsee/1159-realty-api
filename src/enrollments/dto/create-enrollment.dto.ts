import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsUUID,
  IsNotEmpty,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentType {
  INSTALLMENT = 'INSTALLMENT',
  OUTRIGHT = 'OUTRIGHT',
}

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({ description: 'Unit ID (optional)' })
  @IsUUID()
  @IsOptional()
  unitId?: string;

  @ApiPropertyOptional({ description: 'Agent ID (required for admin, auto-populated for agent)' })
  @IsUUID()
  @IsOptional()
  agentId?: string;

  @ApiPropertyOptional({ description: 'Client ID (optional on creation)' })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiProperty({ enum: PaymentType, description: 'Payment type: INSTALLMENT or OUTRIGHT' })
  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @ApiPropertyOptional({ description: 'Selected payment plan ID (required for INSTALLMENT)' })
  @IsUUID()
  @IsOptional()
  selectedPaymentPlanId?: string;

  @ApiPropertyOptional({ description: 'Number of installments for outright payment (max 3, no interest)' })
  @IsNumber()
  @Min(1)
  @Max(3)
  @IsOptional()
  outrightInstallments?: number;

  @ApiProperty({ description: 'Selected unit pricing (e.g., "500 sqm", "1000 sqm")' })
  @IsString()
  @IsNotEmpty()
  selectedUnit: string;

  @ApiPropertyOptional({ description: 'Enrollment date (admin only, defaults to now)' })
  @IsDateString()
  @IsOptional()
  enrollmentDate?: string;
}
