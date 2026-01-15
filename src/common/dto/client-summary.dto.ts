import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class ClientSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'clx456def' })
  userId: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Michael' })
  otherName?: string;

  @ApiProperty({ example: 'client@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional({ example: 'AGT-ABC12-P001', description: 'Partner referral ID (only for approved partners)' })
  referralId?: string;

  @ApiProperty({ example: false })
  hasCompletedOnboarding: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
