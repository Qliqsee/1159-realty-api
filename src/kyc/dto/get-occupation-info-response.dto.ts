import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmploymentStatus } from '@prisma/client';

export class GetOccupationInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ enum: EmploymentStatus, example: EmploymentStatus.EMPLOYED, nullable: true })
  employmentStatus: EmploymentStatus | null;

  @ApiPropertyOptional({ example: 'Acme Corp', nullable: true })
  employerName: string | null;

  @ApiPropertyOptional({ example: 'Software Engineer', nullable: true })
  jobTitle: string | null;

  @ApiPropertyOptional({ example: 'My Business Ltd', nullable: true })
  businessName: string | null;

  @ApiPropertyOptional({ example: 'Retail', nullable: true })
  businessType: string | null;

  @ApiPropertyOptional({ example: '45 Commerce Avenue', nullable: true })
  officeAddress: string | null;
}
