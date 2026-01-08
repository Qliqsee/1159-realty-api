import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseDisbursementDto {
  @ApiProperty({
    description: 'Bank account number',
    example: '0123456789',
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({
    description: 'Bank code (Paystack bank code)',
    example: '058',
  })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({
    description: 'Account holder name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  accountName: string;
}

export class DisbursementReleaseResponseDto {
  @ApiProperty({ description: 'Disbursement ID' })
  disbursementId: string;

  @ApiProperty({ description: 'Amount released' })
  amount: number;

  @ApiProperty({ description: 'Paystack transfer code' })
  transferCode: string;

  @ApiProperty({ description: 'Transfer reference' })
  reference: string;

  @ApiProperty({ description: 'Transfer status' })
  status: string;

  @ApiProperty({ description: 'Success message' })
  message: string;
}
