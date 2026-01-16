import { ApiProperty } from '@nestjs/swagger';

class BrevoContactDto {
  @ApiProperty({ example: '12345' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  phone?: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'List IDs this contact belongs to',
    type: [Number],
  })
  listIds: number[];

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-16T15:45:00Z' })
  modifiedAt: string;
}

export class BrevoContactsResponseDto {
  @ApiProperty({ type: [BrevoContactDto] })
  data: BrevoContactDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
