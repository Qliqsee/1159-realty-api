import { IsInt, Min, IsNumber, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddPaymentPlanDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  @Min(1)
  durationMonths: number;

  @ApiProperty({ example: 5.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;
}
