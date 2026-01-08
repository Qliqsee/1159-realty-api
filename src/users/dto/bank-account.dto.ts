import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankAccountDto {
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

  @ApiProperty({
    description: 'Bank name',
    example: 'GTBank',
  })
  @IsString()
  @IsNotEmpty()
  bankName: string;
}

export class BankAccountResponseDto {
  @ApiProperty({ description: 'Masked account number (e.g., ****5678)' })
  accountNumber: string;

  @ApiProperty({ description: 'Bank code' })
  bankCode: string;

  @ApiProperty({ description: 'Account holder name' })
  accountName: string;

  @ApiProperty({ description: 'Bank name' })
  bankName: string;
}
