import { ApiProperty } from '@nestjs/swagger';

export class KycRejectionItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  kycId: string;

  @ApiProperty({ example: 'Invalid identity document provided' })
  reason: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  createdBy: string;

  @ApiProperty({
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'admin@example.com',
    },
  })
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class KycRejectionsResponseDto {
  @ApiProperty({ type: [KycRejectionItemDto] })
  data: KycRejectionItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}
