import { ApiProperty } from '@nestjs/swagger';
import { KycStatus, KycStep } from '@prisma/client';
import { UserInfoDto } from './list-kycs.dto';
import { RejectionReasonDto } from './get-my-kyc-response.dto';

export class KycHistoryItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  status: KycStatus;

  @ApiProperty()
  submittedAt: Date;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({ nullable: true })
  reviewAction: string | null;

  @ApiProperty({ type: UserInfoDto, nullable: true })
  reviewer: UserInfoDto | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class KycDetailResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ enum: KycStatus, example: KycStatus.SUBMITTED })
  status: KycStatus;

  @ApiProperty({ enum: KycStep, example: KycStep.BANK })
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

  @ApiProperty({ nullable: true })
  submittedAt: Date | null;

  @ApiProperty({ nullable: true })
  reviewedAt: Date | null;

  @ApiProperty({ type: UserInfoDto, nullable: true })
  reviewer: UserInfoDto | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;

  @ApiProperty({ type: [RejectionReasonDto] })
  rejectionReasons: RejectionReasonDto[];

  @ApiProperty({ type: [KycHistoryItemDto] })
  history: KycHistoryItemDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
