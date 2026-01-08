import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResolveInvoiceDto {
  @ApiProperty({ description: 'Payment reference for manual resolution' })
  @IsString()
  @IsNotEmpty()
  paymentReference: string;

  @ApiPropertyOptional({ description: 'Additional notes about the payment' })
  @IsString()
  @IsOptional()
  notes?: string;
}
