import { ApiProperty } from '@nestjs/swagger';
import { PartnershipStatus } from '@prisma/client';

export class ApplyPartnershipResponseDto {
  @ApiProperty({ example: 'Partnership application submitted successfully' })
  message: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.AWAITING_APPROVAL })
  status: PartnershipStatus;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  appliedAt: Date;
}
