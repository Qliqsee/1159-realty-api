import { ApiProperty } from '@nestjs/swagger';

export class GetNextOfKinInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'Joan Akala', nullable: true })
  fullName: string | null;

  @ApiProperty({ example: '+2347064148165', nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ example: 'Sibling', nullable: true })
  relationship: string | null;

  @ApiProperty({ example: '123 Family Street, Lagos', nullable: true })
  address: string | null;
}
