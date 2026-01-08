import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DisbursementConfigMode {
  ALL_EXCEPT = 'ALL_EXCEPT',
  NONE_EXCEPT = 'NONE_EXCEPT',
}

export class UpdateConfigDto {
  @ApiProperty({
    description: 'Disbursement configuration mode',
    enum: DisbursementConfigMode,
    example: 'ALL_EXCEPT',
  })
  @IsEnum(DisbursementConfigMode)
  @IsNotEmpty()
  mode: DisbursementConfigMode;
}
