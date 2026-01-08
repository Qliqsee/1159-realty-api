import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { KycStatus } from '@prisma/client';

export class ApproveKycDto {
  @ApiProperty({
    required: false,
    example: 'All documents verified successfully',
    description: 'Optional feedback message for the approval'
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ApproveKycResponseDto {
  @ApiProperty({ example: 'KYC approved successfully' })
  message: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  kycId: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.APPROVED })
  status: KycStatus;
}
