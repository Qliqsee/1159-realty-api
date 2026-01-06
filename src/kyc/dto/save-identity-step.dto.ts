import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, Matches } from 'class-validator';

export class SaveIdentityStepDto {
  @ApiProperty({ example: 'https://example.com/uploads/id-123.jpg' })
  @IsUrl()
  idImageUrl: string;

  @ApiProperty({ example: 'https://example.com/uploads/profile-123.jpg' })
  @IsUrl()
  profilePictureUrl: string;

  @ApiProperty({ example: '+2347064148165' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;
}
