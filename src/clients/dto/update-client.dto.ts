import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateClientDto {
  @ApiPropertyOptional({ description: 'First name', example: 'Jane' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Other name', example: 'Marie' })
  @IsString()
  @IsOptional()
  otherName?: string;

  @ApiPropertyOptional({ description: 'Phone number', example: '+2348012345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Gender', example: 'FEMALE', enum: Gender })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ description: 'Country', example: 'Nigeria' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'State', example: 'Lagos' })
  @IsString()
  @IsOptional()
  state?: string;
}
