import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateSalesTargetDto {
  @ApiProperty({
    description: 'Email of the user to assign target to',
    example: 'agent@example.com'
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Target amount to achieve',
    example: 1000000.00
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiProperty({
    description: 'Start date of target period',
    example: '2026-01-01'
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date of target period',
    example: '2026-03-31'
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
