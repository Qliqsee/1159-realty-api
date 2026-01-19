import { ApiProperty } from '@nestjs/swagger';

export class GetBankInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'First Bank of Nigeria', nullable: true })
  bankName: string | null;

  @ApiProperty({ example: '1234567890', nullable: true })
  accountNumber: string | null;

  @ApiProperty({ example: 'John Doe', nullable: true })
  accountName: string | null;
}
