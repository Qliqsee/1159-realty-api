import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newSecurePassword123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;
}

export class ResetPasswordResponseDto {
  @ApiProperty({ example: 'Password reset successfully' })
  message: string;
}
