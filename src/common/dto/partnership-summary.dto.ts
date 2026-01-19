import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnershipStatus } from '@prisma/client';

export class PartnershipSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'APPROVED', enum: PartnershipStatus })
  status: PartnershipStatus;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  appliedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-16T14:20:00.000Z' })
  reviewedAt?: Date;
}
