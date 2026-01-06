import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class SaveAddressStepDto {
  @ApiProperty({ example: 'Nigeria' })
  @IsString()
  @MinLength(2)
  country: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @MinLength(2)
  state: string;

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
