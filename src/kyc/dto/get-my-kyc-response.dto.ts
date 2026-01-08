import { ApiProperty } from '@nestjs/swagger';
import { KycStatus, KycStep } from '@prisma/client';
import { DraftChangeDto } from './draft-change.dto';

export class RejectionReasonDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Invalid identity document provided' })
  reason: string;

  @ApiProperty({ example: 'Invalid identity document...' })
  truncatedReason: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;
}

export class GetMyKycResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.DRAFT })
  status: KycStatus;

  @ApiProperty({ enum: KycStep, example: KycStep.ADDRESS })
  currentStep: KycStep;

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

  @ApiProperty({ required: false, nullable: true })
  personalDraft: any;

  @ApiProperty({ required: false, nullable: true })
  addressDraft: any;

  @ApiProperty({ required: false, nullable: true })
  occupationDraft: any;

  @ApiProperty({ required: false, nullable: true })
  identityDraft: any;

  @ApiProperty({ required: false, nullable: true })
  nextOfKinDraft: any;

  @ApiProperty({ required: false, nullable: true })
  bankDraft: any;

  @ApiProperty({ type: [DraftChangeDto] })
  draftChanges: DraftChangeDto[];

  @ApiProperty({ type: [RejectionReasonDto] })
  rejectionReasons: RejectionReasonDto[];

  @ApiProperty({ required: false, nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ required: false, nullable: true })
  reviewedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
