import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalesTargetDto } from './create-sales-target.dto';

export class BatchCreateTargetsDto {
  @ApiProperty({
    description: 'Array of sales targets to create',
    type: [CreateSalesTargetDto],
    example: [
      {
        email: 'agent1@example.com',
        targetAmount: 1000000,
        startDate: '2026-01-01',
        endDate: '2026-03-31'
      },
      {
        email: 'agent2@example.com',
        targetAmount: 500000,
        startDate: '2026-01-01',
        endDate: '2026-03-31'
      }
    ]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSalesTargetDto)
  targets: CreateSalesTargetDto[];
}
