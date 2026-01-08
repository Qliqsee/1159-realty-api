import { ApiProperty } from '@nestjs/swagger';

export class InterestStatsDto {
  @ApiProperty({
    description: 'Total number of interests',
    example: 150,
  })
  totalInterests: number;

  @ApiProperty({
    description: 'Number of open interests',
    example: 85,
  })
  openInterests: number;

  @ApiProperty({
    description: 'Number of closed interests',
    example: 65,
  })
  closedInterests: number;
}
