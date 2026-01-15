import { IsString, IsNumber, IsNotEmpty, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddUnitPricingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  regularPrice: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  prelaunchPrice: number;
}
