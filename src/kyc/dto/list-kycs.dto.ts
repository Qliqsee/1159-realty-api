import { ApiProperty } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListKycsQueryDto {
  @ApiProperty({ required: false, description: 'Search by client name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ enum: KycStatus, required: false })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;

  @ApiProperty({ required: false, description: 'Filter by submission date from (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  submissionDateFrom?: string;

  @ApiProperty({ required: false, description: 'Filter by submission date to (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  submissionDateTo?: string;

  @ApiProperty({ required: false, description: 'Filter by review date from (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  reviewDateFrom?: string;

  @ApiProperty({ required: false, description: 'Filter by review date to (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  reviewDateTo?: string;

  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}

export class ClientInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  name: string | null;

  @ApiProperty({
    example: {
      email: 'john.doe@example.com',
    },
  })
  user: {
    email: string;
  };
}

export class KycListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  clientId: string;

  @ApiProperty({ type: ClientInfoDto })
  client: ClientInfoDto;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  status: KycStatus;

  @ApiProperty({ required: false, nullable: true, description: 'Client personal information from onboarding' })
  personal: {
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    maritalStatus?: string;
  } | null;

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class ListKycsResponseDto {
  @ApiProperty({ type: [KycListItemDto] })
  data: KycListItemDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: true })
  hasMore: boolean;
}
