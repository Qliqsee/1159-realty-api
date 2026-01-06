import { ApiProperty } from '@nestjs/swagger';

export class ResendOtpDto {
  // No body needed - user from JWT
}

export class ResendOtpResponseDto {
  @ApiProperty({ example: 'OTP resent to your email' })
  message: string;

  @ApiProperty({ example: '2024-01-06T14:00:00Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2024-01-06T13:50:00Z' })
  canResendAt: Date;
}
