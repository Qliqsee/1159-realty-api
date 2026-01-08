import { ApiProperty } from '@nestjs/swagger';
import { PartnershipStatus } from '@prisma/client';

export class SuspendPartnershipResponseDto {
  @ApiProperty({ example: 'Partnership suspended successfully' })
  message: string;

  @ApiProperty({ example: 'clx123abc' })
  partnershipId: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.APPROVED })
  status: PartnershipStatus;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  suspendedAt: Date;
}

export class UnsuspendPartnershipResponseDto {
  @ApiProperty({ example: 'Partnership unsuspended successfully' })
  message: string;

  @ApiProperty({ example: 'clx123abc' })
  partnershipId: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.APPROVED })
  status: PartnershipStatus;
}
