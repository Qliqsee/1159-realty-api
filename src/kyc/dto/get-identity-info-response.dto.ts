import { ApiProperty } from '@nestjs/swagger';

export class GetIdentityInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'https://example.com/uploads/id-123.jpg', nullable: true })
  idImageUrl: string | null;

  @ApiProperty({ example: 'https://example.com/uploads/profile-123.jpg', nullable: true })
  profilePictureUrl: string | null;

  @ApiProperty({ example: '+2347064148165', nullable: true })
  phoneNumber: string | null;
}
