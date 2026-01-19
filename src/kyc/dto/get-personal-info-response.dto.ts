import { ApiProperty } from '@nestjs/swagger';
import { Gender, MaritalStatus } from '@prisma/client';

export class GetPersonalInfoResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Client ID' })
  clientId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'John', nullable: true })
  firstName: string | null;

  @ApiProperty({ example: 'Doe', nullable: true })
  lastName: string | null;

  @ApiProperty({ example: '1990-01-15', nullable: true })
  dob: string | null;

  @ApiProperty({ enum: Gender, example: Gender.MALE, nullable: true })
  gender: Gender | null;

  @ApiProperty({ enum: MaritalStatus, example: MaritalStatus.SINGLE, nullable: true })
  maritalStatus: MaritalStatus | null;
}
