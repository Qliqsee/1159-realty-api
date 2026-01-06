import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  // No body needed - user from JWT
}

export class SendOtpResponseDto {
  @ApiProperty({ example: 'OTP sent to your email' })
  message: string;

  @ApiProperty({ example: '2024-01-06T14:00:00Z' })
  expiresAt: Date;

  @ApiProperty({ example: '2024-01-06T13:50:00Z', required: false })
  canResendAt?: Date;
}
