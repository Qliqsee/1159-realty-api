import { ApiProperty } from '@nestjs/swagger';
import { KycStatus, KycStep } from '@prisma/client';
import { ClientInfoDto } from './list-kycs.dto';
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

  @ApiProperty({ type: ClientInfoDto, nullable: true })
  reviewer: ClientInfoDto | null;

  @ApiProperty({ nullable: true })
  feedback: string | null;

  @ApiProperty()
  createdAt: Date;
}

export class AdminInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Admin Name', nullable: true })
  name: string | null;

  @ApiProperty({
    example: {
      email: 'admin@example.com',
    },
  })
  user: {
    email: string;
  };
}

export class KycDetailResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  clientId: string;

  @ApiProperty({ type: ClientInfoDto })
  client: ClientInfoDto;

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

  @ApiProperty({ type: AdminInfoDto, nullable: true })
  reviewer: AdminInfoDto | null;

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
