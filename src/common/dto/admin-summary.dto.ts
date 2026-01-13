import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'clx456def' })
  userId: string;

  @ApiPropertyOptional({ example: 'Jane' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'Marie' })
  otherName?: string;

  @ApiProperty({ example: 'admin@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  createdAt: Date;
}
