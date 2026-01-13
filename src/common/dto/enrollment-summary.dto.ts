import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '@prisma/client';

export class EnrollmentSummaryDto {
  @ApiProperty({ example: 'clx123abc' })
  id: string;

  @ApiProperty({ example: 'clx456def' })
  propertyId: string;

  @ApiProperty({ example: 'Ocean View Estate' })
  propertyName: string;

  @ApiProperty({ example: 'ONGOING', enum: EnrollmentStatus })
  status: EnrollmentStatus;

  @ApiProperty({ example: '5000000.00' })
  totalAmount: string;

  @ApiProperty({ example: '1500000.00' })
  amountPaid: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  enrollmentDate: Date;
}
