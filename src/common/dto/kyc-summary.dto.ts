import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KycStatus, KycStep } from '@prisma/client';

export class KycSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'APPROVED', enum: KycStatus })
  status: KycStatus;

  @ApiProperty({ example: 'BANK', enum: KycStep })
  currentStep: KycStep;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  submittedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-16T14:20:00.000Z' })
  reviewedAt?: Date;
}
