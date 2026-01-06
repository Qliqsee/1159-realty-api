import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectKycDto {
  @ApiProperty({ example: 'ID document is unclear. Please resubmit with a clearer image.' })
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  reason: string;
}

export class RejectKycResponseDto {
  @ApiProperty({ example: 'KYC rejected successfully' })
  message: string;
}
