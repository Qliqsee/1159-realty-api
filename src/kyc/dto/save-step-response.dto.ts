import { ApiProperty } from '@nestjs/swagger';
import { KycStatus, KycStep } from '@prisma/client';

export class SaveStepResponseDto {
  @ApiProperty({ example: 'Step saved successfully' })
  message: string;

  @ApiProperty({ enum: KycStatus, example: KycStatus.DRAFT })
  status: KycStatus;

  @ApiProperty({ enum: KycStep, example: KycStep.ADDRESS })
  currentStep: KycStep;
}

export class SavePersonalStepResponseDto extends SaveStepResponseDto {
  @ApiProperty({ example: true })
  hasCompletedOnboarding: boolean;
}

export class SaveAddressStepResponseDto extends SaveStepResponseDto {}

export class SaveOccupationStepResponseDto extends SaveStepResponseDto {}

export class SaveIdentityStepResponseDto extends SaveStepResponseDto {}

export class SaveNextOfKinStepResponseDto extends SaveStepResponseDto {}

export class SaveBankStepResponseDto extends SaveStepResponseDto {}
