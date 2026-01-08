import { IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddInspectionDateDto {
  @ApiProperty({ example: '2026-02-15T10:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  inspectionDate: string;
}
