import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Gender, MaritalStatus } from '@prisma/client';

export class SavePersonalStepDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: '1990-01-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: MaritalStatus, example: MaritalStatus.SINGLE })
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus;

  @ApiProperty({ example: 'Social Media', required: false })
  @IsOptional()
  @IsString()
  referralSource?: string;
}
