import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class SaveBankStepDto {
  @ApiProperty({ example: 'First Bank of Nigeria' })
  @IsString()
  @MinLength(2)
  bankName: string;

  @ApiProperty({ example: '1234567890' })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'Account number must be exactly 10 digits' })
  accountNumber: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  accountName: string;
}
