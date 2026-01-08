import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional } from 'class-validator';
import { KycStatus } from '@prisma/client';

export class RejectKycDto {
  @ApiProperty({ example: 'ID document is unclear. Please resubmit with a clearer image.' })
  @IsString()
  @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
  reason: string;

  @ApiProperty({
    required: false,
    example: 'Please ensure document is clear and all corners are visible',
    description: 'Optional additional feedback for the rejection'
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class RejectKycResponseDto {
  @ApiProperty({ example: 'KYC rejected successfully' })
  message: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  kycId: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.REJECTED })
  status: KycStatus;
}
