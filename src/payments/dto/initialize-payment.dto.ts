import { IsString, IsNotEmpty, IsUUID, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiProperty({ description: 'Invoice ID to pay' })
  @IsUUID()
  @IsNotEmpty()
  invoiceId: string;

  @ApiPropertyOptional({ description: 'Customer email (for unauthenticated payments)' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Callback URL after payment' })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
