import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, Country } from '@prisma/client';

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

  @ApiPropertyOptional({ description: 'Country', enum: Country, example: 'NIGERIA' })
  @IsEnum(Country)
  @IsOptional()
  country?: Country;

  @ApiPropertyOptional({ description: 'State ID (1-37 for Nigerian states)', example: 24 })
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  stateId?: number;
}
