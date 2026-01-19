import { ApiProperty } from '@nestjs/swagger';
import { Country } from '@prisma/client';

export class GetAddressInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ enum: Country, example: 'NIGERIA', nullable: true })
  country: Country | null;

  @ApiProperty({ example: 24, description: 'State ID', nullable: true })
  stateId: number | null;

  @ApiProperty({ example: 'Ikeja', nullable: true })
  lga: string | null;

  @ApiProperty({ example: '123 Main Street, Victoria Island', nullable: true })
  address: string | null;

  @ApiProperty({ example: 'Nigerian', nullable: true })
  nationality: string | null;
}
