import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  otherName?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class DeleteUserResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}

export class RemoveRoleResponseDto {
  @ApiProperty({ example: 'Role removed from user successfully' })
  message: string;
}

export class EnrollmentSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  propertyName: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  enrollmentDate: Date;
}

export class KYCInfoDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  currentStep: string;

  @ApiPropertyOptional()
  submittedAt?: Date;

  @ApiPropertyOptional()
  reviewedAt?: Date;
}

export class PartnershipInfoDto {
  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  partnerLink?: string;

  @ApiPropertyOptional()
  referredByPartnerId?: string;

  @ApiPropertyOptional()
  referredByPartnerName?: string;
}

export class LeadConversionInfoDto {
  @ApiPropertyOptional()
  leadId?: string;

  @ApiPropertyOptional()
  closedBy?: string;

  @ApiPropertyOptional()
  closedByAgentName?: string;
}

export class UserDetailsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  otherName?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  state?: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  hasCompletedOnboarding: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  totalSpent: number;

  @ApiProperty()
  activeEnrollments: number;

  @ApiProperty()
  completedEnrollments: number;

  @ApiPropertyOptional({ type: KYCInfoDto })
  kyc?: KYCInfoDto;

  @ApiPropertyOptional({ type: LeadConversionInfoDto })
  leadConversion?: LeadConversionInfoDto;

  @ApiPropertyOptional()
  assignedAgentId?: string;

  @ApiPropertyOptional()
  assignedAgentName?: string;

  @ApiPropertyOptional({ type: PartnershipInfoDto })
  partnership?: PartnershipInfoDto;

  @ApiProperty({ type: [EnrollmentSummaryDto] })
  enrollments: EnrollmentSummaryDto[];

  @ApiProperty()
  isSuspended: boolean;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty()
  totalEnrollments: number;

  @ApiProperty()
  totalPaid: number;

  @ApiProperty()
  totalPending: number;
}

export class UserStatsResponseDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalMale: number;

  @ApiProperty()
  totalFemale: number;

  @ApiProperty()
  totalPartners: number;

  @ApiProperty()
  totalAgents: number;

  @ApiProperty()
  totalClients: number;

  @ApiProperty()
  totalActive: number;

  @ApiProperty()
  totalSuspended: number;
}

export class MyStatsResponseDto {
  @ApiProperty()
  totalClients: number;

  @ApiProperty()
  totalMale: number;

  @ApiProperty()
  totalFemale: number;

  @ApiProperty()
  totalPartners: number;
}

export class ReferralInfoResponseDto {
  @ApiPropertyOptional()
  partnerLink?: string;

  @ApiPropertyOptional()
  referralCode?: string;

  @ApiProperty()
  totalReferredClients: number;

  @ApiProperty()
  isPartner: boolean;

  @ApiPropertyOptional()
  partnershipStatus?: string;
}
