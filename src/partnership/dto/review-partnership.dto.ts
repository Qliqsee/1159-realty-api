import { ApiProperty } from '@nestjs/swagger';
import { PartnershipStatus } from '@prisma/client';

export class ApprovePartnershipResponseDto {
  @ApiProperty({ example: 'Partnership approved successfully' })
  message: string;

  @ApiProperty({ example: 'clx123abc' })
  partnershipId: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.APPROVED })
  status: PartnershipStatus;
}

export class RejectPartnershipResponseDto {
  @ApiProperty({ example: 'Partnership rejected successfully' })
  message: string;

  @ApiProperty({ example: 'clx123abc' })
  partnershipId: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.REJECTED })
  status: PartnershipStatus;

  @ApiProperty({ example: '2024-04-09T10:00:00.000Z', description: '90 days cooldown period' })
  rejectionCooldown: Date;
}
