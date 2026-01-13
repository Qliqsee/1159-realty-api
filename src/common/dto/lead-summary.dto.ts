import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeadStatus } from '@prisma/client';

export class LeadSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'lead@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  phone?: string;

  @ApiProperty({ example: 'AVAILABLE', enum: LeadStatus })
  status: LeadStatus;
}
