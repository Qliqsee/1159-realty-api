import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class ClientInfoDto {
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

  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;

  @ApiPropertyOptional({ example: 'MALE', enum: Gender })
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Google Ads' })
  referralSource?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  country?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  state?: string;

  @ApiProperty({ example: false })
  hasCompletedOnboarding: boolean;

  @ApiPropertyOptional({ example: 'ABC123XYZ' })
  partnerLink?: string;

  @ApiPropertyOptional({ example: 'clx789ghi' })
  referredByPartnerId?: string;

  @ApiPropertyOptional({ example: '0123456789' })
  accountNumber?: string;

  @ApiPropertyOptional({ example: '044' })
  bankCode?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  accountName?: string;

  @ApiPropertyOptional({ example: 'Access Bank' })
  bankName?: string;

  @ApiPropertyOptional({ example: 'clx999jkl' })
  leadId?: string;

  @ApiPropertyOptional({ example: 'clx888mno' })
  closedBy?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class AdminInfoDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'clx456def' })
  userId: string;

  @ApiPropertyOptional({ example: 'Jane' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Marie' })
  otherName?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;

  @ApiPropertyOptional({ example: '1990-05-20T00:00:00.000Z' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ example: '0123456789' })
  accountNumber?: string;

  @ApiPropertyOptional({ example: '044' })
  bankCode?: string;

  @ApiPropertyOptional({ example: 'Jane Smith' })
  accountName?: string;

  @ApiPropertyOptional({ example: 'Access Bank' })
  bankName?: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  street?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  city?: string;

  @ApiPropertyOptional({ example: 'Lagos' })
  state?: string;

  @ApiPropertyOptional({ example: 'Nigeria' })
  country?: string;

  @ApiPropertyOptional({ example: '100001' })
  postalCode?: string;

  @ApiProperty({ example: true })
  canOnboardClients: boolean;

  @ApiProperty({ example: false })
  isBanned: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class UserInfoDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: false })
  isSuspended: boolean;

  @ApiProperty({ example: false })
  isBanned: boolean;

  @ApiProperty({ example: 'admin', enum: ['admin', 'client'] })
  userType: 'admin' | 'client';

  @ApiProperty({ example: ['agent'], type: [String] })
  roles: string[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ type: ClientInfoDto })
  client?: ClientInfoDto;

  @ApiPropertyOptional({ type: AdminInfoDto })
  admin?: AdminInfoDto;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({
    example: ['properties:read', 'properties:create', 'enrollments:read'],
    type: [String],
  })
  capabilities: string[];
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({
    example: ['properties:read', 'properties:create', 'enrollments:read'],
    type: [String],
  })
  capabilities: string[];
}

export class GetMeResponseDto {
  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({
    example: ['properties:read', 'properties:create', 'enrollments:read'],
    type: [String],
  })
  capabilities: string[];
}
