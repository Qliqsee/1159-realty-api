import { ApiProperty } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';

export class KycHistoryItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  kycId: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  status: KycStatus;

  @ApiProperty({ required: false, nullable: true })
  personal: any;

  @ApiProperty({ required: false, nullable: true })
  address: any;

  @ApiProperty({ required: false, nullable: true })
  occupation: any;

  @ApiProperty({ required: false, nullable: true })
  identity: any;

  @ApiProperty({ required: false, nullable: true })
  nextOfKin: any;

  @ApiProperty({ required: false, nullable: true })
  bank: any;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  personalStatus: KycStatus;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  addressStatus: KycStatus;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  occupationStatus: KycStatus;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  identityStatus: KycStatus;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  nextOfKinStatus: KycStatus;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  bankStatus: KycStatus;

  @ApiProperty({ type: [String], example: ['Invalid document'] })
  rejectionReasons: string[];

  @ApiProperty({ required: false, nullable: true })
  feedback: string | null;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ required: false, nullable: true })
  reviewedBy: string | null;

  @ApiProperty({ required: false, nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'admin@example.com',
    },
  })
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export class KycHistoryResponseDto {
  @ApiProperty({ type: [KycHistoryItemDto] })
  data: KycHistoryItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
