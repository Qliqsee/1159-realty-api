import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AdminSummaryDto,
  ClientSummaryDto,
  KycSummaryDto,
  PartnershipSummaryDto,
  LeadSummaryDto,
  EnrollmentSummaryDto,
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

  @ApiPropertyOptional({ description: 'Lead ID' })
  leadId?: string;

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
}

export class ClientProfileResponseDto extends ClientResponseDto {
  @ApiProperty({ description: 'Capabilities', example: ['properties:read', 'properties:create', 'enrollments:read'], type: [String] })
  capabilities: string[];
}

export class ClientDetailResponseDto extends ClientResponseDto {
  @ApiPropertyOptional({ type: KycSummaryDto })
  kyc?: KycSummaryDto | null;

  @ApiPropertyOptional({ type: PartnershipSummaryDto })
  partnership?: PartnershipSummaryDto | null;

  @ApiPropertyOptional({ type: LeadSummaryDto })
  lead?: LeadSummaryDto | null;

  @ApiPropertyOptional({ type: AdminSummaryDto })
  closedByAgent?: AdminSummaryDto | null;

  @ApiPropertyOptional({ type: ClientSummaryDto })
  referredByPartner?: ClientSummaryDto | null;

  @ApiProperty({ type: [EnrollmentSummaryDto] })
  enrollments: EnrollmentSummaryDto[];
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

export class BankAccountResponseDto {
  @ApiProperty({ description: 'Masked account number', example: '****6789' })
  accountNumber: string;

  @ApiProperty({ description: 'Bank code', example: '058' })
  bankCode: string;

  @ApiProperty({ description: 'Account name', example: 'Jane Doe' })
  accountName: string;

  @ApiProperty({ description: 'Bank name', example: 'GTBank' })
  bankName: string;
}
