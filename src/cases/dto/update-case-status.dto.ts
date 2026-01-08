import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum CaseStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export class UpdateCaseStatusDto {
  @ApiProperty({
    example: 'COMPLETED',
    description: 'Case status',
    enum: CaseStatus,
  })
  @IsEnum(CaseStatus)
  @IsNotEmpty()
  status: CaseStatus;
}
