import { ApiProperty } from '@nestjs/swagger';

export class SubmitKycDto {
  // No body needed - just triggers submission
}

export class SubmitKycResponseDto {
  @ApiProperty({ example: 'KYC submitted for review successfully' })
  message: string;
}
