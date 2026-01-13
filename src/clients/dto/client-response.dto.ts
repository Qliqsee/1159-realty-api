import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto,
  PaginationMetaDto
} from '../../common/dto';

export class ClientResponseDto {
  @ApiProperty({ description: 'Client ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Email address', example: 'client@example.com' })
  email: string;

  @ApiProperty({ description: 'Is email verified', example: false })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ description: 'First name', example: 'Jane' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Other name', example: 'Marie' })
  otherName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+2348012345678' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'FEMALE' })
  gender?: string;

  @ApiPropertyOptional({ description: 'Referral source', example: 'Facebook' })
  referralSource?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'Nigeria' })
  country?: string;

  @ApiPropertyOptional({ description: 'State', example: 'Lagos' })
  state?: string;

  @ApiProperty({ description: 'Has completed onboarding', example: false })
  hasCompletedOnboarding: boolean;

  @ApiPropertyOptional({ description: 'Partner link' })
  partnerLink?: string;

  @ApiPropertyOptional({ description: 'Referred by partner ID' })
  referredByPartnerId?: string;

  @ApiPropertyOptional({ description: 'Closed by admin ID' })
  closedBy?: string;

  @ApiProperty({ description: 'Is user suspended', example: false })
  isSuspended: boolean;

  @ApiProperty({ description: 'Is user banned', example: false })
  isBanned: boolean;

  @ApiProperty({ description: 'Roles assigned', example: ['client'] })
  roles: string[];

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;

  // Optional fields that can be included via query parameters
  @ApiPropertyOptional({ description: 'Capabilities', example: ['properties:read', 'enrollments:read'], type: [String] })
  capabilities?: string[];

  @ApiPropertyOptional({ type: () => KycSummaryDto })
  kyc?: KycSummaryDto | null;

  @ApiPropertyOptional({ type: () => PartnershipSummaryDto })
  partnership?: PartnershipSummaryDto | null;

  @ApiPropertyOptional({ type: () => AdminSummaryDto })
  closedByAgent?: AdminSummaryDto | null;

  @ApiPropertyOptional({ type: () => ClientSummaryDto })
  referredByPartner?: ClientSummaryDto | null;
}

export class ReferralsResponseDto {
  @ApiProperty({ example: 25 })
  totalReferrals: number;

  @ApiProperty({ type: [ClientSummaryDto] })
  referrals: ClientSummaryDto[];
}

export class ClientListResponseDto {
  @ApiProperty({ type: [ClientSummaryDto] })
  data: ClientSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
