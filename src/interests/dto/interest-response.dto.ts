import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InterestPropertyDto {
  @ApiProperty({ example: 'clx123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Lekki Paradise Estate' })
  name: string;

  @ApiProperty({ example: 'LAND' })
  type: string;

  @ApiProperty({ example: 'Residential Land' })
  subtype: string;

  @ApiProperty({ example: 'AVAILABLE' })
  status: string;

  @ApiProperty({ example: 'Nigeria' })
  country: string;

  @ApiProperty({ example: 'Lagos' })
  state?: string;
}

export class InterestClientDto {
  @ApiProperty({ example: 'clx123abc456def789' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: '+2348012345678' })
  phone?: string;
}

export class InterestAgentDto {
  @ApiProperty({ example: 'clx123abc456def789' })
  id: string;

  @ApiProperty({ example: 'Jane Smith' })
  name: string;

  @ApiProperty({ example: 'jane.smith@example.com' })
  email: string;

  @ApiProperty({ example: '+2348087654321' })
  phone?: string;
}

export class InterestResponseDto {
  @ApiProperty({ example: 'clx123abc456def789' })
  id: string;

  @ApiProperty({ type: InterestPropertyDto })
  property: InterestPropertyDto;

  @ApiProperty({ type: InterestClientDto })
  client: InterestClientDto;

  @ApiPropertyOptional({
    type: InterestAgentDto,
    description: 'Agent assigned to this interest (if any)',
  })
  agent?: InterestAgentDto;

  @ApiPropertyOptional({
    example: 'I am interested in purchasing this property for investment purposes.',
  })
  message?: string;

  @ApiProperty({ example: 'OPEN', enum: ['OPEN', 'CLOSED'] })
  status: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Date when interest was marked as attended',
  })
  contactedAt?: Date;

  @ApiProperty({ example: '2024-01-10T08:20:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}
