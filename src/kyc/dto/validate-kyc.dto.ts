import { ApiProperty } from '@nestjs/swagger';
import { KycStep } from '@prisma/client';

export class ValidationErrorDto {
  @ApiProperty({ enum: KycStep, example: KycStep.PERSONAL })
  step: KycStep;

  @ApiProperty({ example: 'firstName', description: 'The field that has an error' })
  field: string;

  @ApiProperty({ example: 'First name is required' })
  message: string;
}

export class ValidateKycResponseDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: [ValidationErrorDto] })
  errors: ValidationErrorDto[];
}
