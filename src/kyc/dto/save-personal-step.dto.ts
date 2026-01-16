import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { Gender, MaritalStatus } from '@prisma/client';
import { TrafficSource } from '../../common/enums';

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

  @ApiProperty({ enum: TrafficSource, example: TrafficSource.INSTAGRAM, required: false })
  @IsOptional()
  @IsEnum(TrafficSource)
  referralSource?: TrafficSource;

  @ApiProperty({ example: 'AGT-ABC12', description: 'Agent or Partner referral ID (required)' })
  @IsString()
  referralId: string;
}
