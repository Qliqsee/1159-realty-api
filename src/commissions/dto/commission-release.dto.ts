import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReleaseCommissionDto {
  @ApiProperty({ description: 'Recipient account number' })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty({ description: 'Recipient bank code' })
  @IsString()
  @IsNotEmpty()
  bankCode: string;

  @ApiProperty({ description: 'Recipient name' })
  @IsString()
  @IsNotEmpty()
  accountName: string;
}

export class CommissionReleaseResponseDto {
  @ApiProperty()
  commissionId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  transferCode: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;
}
