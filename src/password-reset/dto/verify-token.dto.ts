import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyTokenDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  token: string;
}

export class VerifyTokenResponseDto {
  @ApiProperty({ example: true })
  valid: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  userId?: string;
}
