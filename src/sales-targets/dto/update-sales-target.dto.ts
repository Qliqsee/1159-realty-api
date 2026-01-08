import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdateSalesTargetDto {
  @ApiProperty({
    description: 'Target amount to achieve',
    example: 1500000.00,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  targetAmount?: number;

  @ApiProperty({
    description: 'Start date of target period',
    example: '2026-01-01',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date of target period',
    example: '2026-03-31',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
