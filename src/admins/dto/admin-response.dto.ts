import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto';
import { Country } from '@prisma/client';

class StateDto {
  @ApiProperty({ description: 'State ID', example: 24 })
  id: number;

  @ApiProperty({ description: 'State name', example: 'Lagos' })
  name: string;

  @ApiPropertyOptional({ description: 'State capital', example: 'Ikeja' })
  capital?: string;
}

export class AdminResponseDto {
  @ApiProperty({ description: 'Admin ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Email address', example: 'admin@example.com' })
  email: string;

  @ApiProperty({ description: 'Is email verified', example: false })
  isEmailVerified: boolean;

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ description: 'Other name', example: 'Michael' })
  otherName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+2348012345678' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ description: 'Agent referral ID', example: 'AGT-ABC12' })
  referralId?: string;

  @ApiPropertyOptional({ description: 'Street address' })
  street?: string;

  @ApiPropertyOptional({ description: 'City' })
  city?: string;

  @ApiPropertyOptional({ description: 'State', type: StateDto })
  state?: StateDto;

  @ApiPropertyOptional({ description: 'Country', enum: Country, example: 'NIGERIA' })
  country?: Country;

  @ApiPropertyOptional({ description: 'Postal code' })
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Bank account number', example: '0123456789' })
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank code', example: '058' })
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Account name', example: 'John Doe' })
  accountName?: string;

  @ApiPropertyOptional({ description: 'Bank name', example: 'GTBank' })
  bankName?: string;

  @ApiProperty({ description: 'Can onboard clients', example: true })
  canOnboardClients: boolean;

  @ApiProperty({ description: 'Is banned', example: false })
  isBanned: boolean;

  @ApiProperty({ description: 'Is user suspended', example: false })
  isSuspended: boolean;

  @ApiProperty({ description: 'Roles assigned', example: ['agent', 'admin'] })
  roles: string[];

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}

export class AdminListResponseDto {
  @ApiProperty({ type: [AdminResponseDto] })
  data: AdminResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
