import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBankAccountDto {
  @ApiProperty({ description: 'Bank account number', example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ description: 'Bank code', example: '058' })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({ description: 'Account name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ description: 'Bank name', example: 'GTBank' })
  @IsString()
  @IsNotEmpty()
  bankName: string;
}
