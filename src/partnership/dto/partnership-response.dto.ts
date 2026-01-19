import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnershipStatus } from '@prisma/client';

export class PartnershipResponseDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ enum: PartnershipStatus, example: PartnershipStatus.AWAITING_APPROVAL })
  status: PartnershipStatus;

  @ApiPropertyOptional({ example: '2024-01-08T10:00:00.000Z' })
  appliedAt?: Date;

  @ApiPropertyOptional({ example: '2024-01-09T10:00:00.000Z' })
  reviewedAt?: Date;

  @ApiPropertyOptional({ example: 'admin123' })
  reviewedBy?: string;

  @ApiPropertyOptional({ example: '2024-01-09T10:00:00.000Z' })
  rejectedAt?: Date;

  @ApiPropertyOptional({ example: '2024-04-09T10:00:00.000Z', description: '90 days after rejection' })
  rejectionCooldown?: Date;

  @ApiPropertyOptional({ example: 'AGT-ABC12-P001', description: 'Partner referral ID' })
  referralId?: string;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-08T10:00:00.000Z' })
  updatedAt: Date;
}

export class PartnershipWithUserDto extends PartnershipResponseDto {
  @ApiProperty({
    example: {
      id: 'client123',
      userId: 'user123',
      name: 'John Doe',
      email: 'client@example.com',
    },
  })
  client: {
    id: string;
    userId: string;
    name: string;
    email: string;
  };
}
