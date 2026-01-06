import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestResetDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class RequestResetResponseDto {
  @ApiProperty({ example: 'If the email exists, a password reset link has been sent' })
  message: string;
}
