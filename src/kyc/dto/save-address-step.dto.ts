import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { Country } from '@prisma/client';

export class SaveAddressStepDto {
  @ApiProperty({ enum: Country, example: 'NIGERIA' })
  @IsEnum(Country)
  country: Country;

  @ApiProperty({ example: 24, description: 'State ID (1-37 for Nigerian states)' })
  @IsInt()
  @Type(() => Number)
  stateId: number;

  @ApiProperty({ example: 'Ikeja' })
  @IsString()
  @MinLength(2)
  lga: string;

  @ApiProperty({ example: '123 Main Street, Victoria Island' })
  @IsString()
  @MinLength(5)
  address: string;

  @ApiProperty({ example: 'Nigerian' })
  @IsString()
  @MinLength(2)
  nationality: string;
}
