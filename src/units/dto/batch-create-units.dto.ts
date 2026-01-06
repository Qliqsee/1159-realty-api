import { IsArray, ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';
import { CreateUnitDto } from './create-unit.dto';

export class BatchUnitDto extends OmitType(CreateUnitDto, ['propertyId'] as const) {}

export class BatchCreateUnitsDto {
  @ApiProperty({ type: [BatchUnitDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUnitDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  units: BatchUnitDto[];
}
