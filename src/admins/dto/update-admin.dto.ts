import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Country } from '@prisma/client';

export class UpdateAdminDto {
  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Other name', example: 'Michael' })
  @IsString()
  @IsOptional()
  otherName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Date of birth', example: '1990-01-01' })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsOptional()
  street?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Lagos' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State ID (1-37 for Nigerian states, see /states endpoint)', example: 24 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  stateId?: number;

  @ApiPropertyOptional({ description: 'Country', enum: Country, example: 'NIGERIA' })
  @IsEnum(Country)
  @IsOptional()
  country?: Country;

  @ApiPropertyOptional({ description: 'Postal code', example: '100001' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'Bank account number', example: '0123456789' })
  @IsString()
  @IsOptional()
  accountNumber?: string;

  @ApiPropertyOptional({ description: 'Bank code', example: '058' })
  @IsString()
  @IsOptional()
  bankCode?: string;

  @ApiPropertyOptional({ description: 'Account name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  accountName?: string;

  @ApiPropertyOptional({ description: 'Bank name', example: 'GTBank' })
  @IsString()
  @IsOptional()
  bankName?: string;
}
