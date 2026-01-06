import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class SaveNextOfKinStepDto {
  @ApiProperty({ example: 'Joan Akala' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ example: '+2347064148165' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  phoneNumber: string;

  @ApiProperty({ example: 'Sibling' })
  @IsString()
  @MinLength(2)
  relationship: string;

  @ApiProperty({ example: '123 Family Street, Lagos' })
  @IsString()
  @MinLength(5)
  address: string;
}
