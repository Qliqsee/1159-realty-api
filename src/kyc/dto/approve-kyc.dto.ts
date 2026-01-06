import { ApiProperty } from '@nestjs/swagger';

export class ApproveKycDto {
  // No body needed - just triggers approval
}

export class ApproveKycResponseDto {
  @ApiProperty({ example: 'KYC approved successfully' })
  message: string;
}
