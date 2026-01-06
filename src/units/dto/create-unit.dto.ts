import {
  IsString,
  IsEnum,
  IsOptional,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UnitStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  RESERVED = 'RESERVED',
  ARCHIVED = 'ARCHIVED',
}

export class CreateUnitDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coordinate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  feature?: string;

  @ApiPropertyOptional({ enum: UnitStatus })
  @IsEnum(UnitStatus)
  @IsOptional()
  status?: UnitStatus;
}
