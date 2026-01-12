import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PropertyType {
  LAND = 'LAND',
  APARTMENT = 'APARTMENT',
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  PRE_LAUNCH = 'PRE_LAUNCH',
  SOLD_OUT = 'SOLD_OUT',
  RESERVED = 'RESERVED',
  ARCHIVED = 'ARCHIVED',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  YOUTUBE = 'YOUTUBE',
  INSTAGRAM = 'INSTAGRAM',
}

export class AgriculturalFeeDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class SalesDiscountDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty()
  @IsBoolean()
  isActive: boolean;
}

export class PropertyUnitPricingDto {
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

export class PropertyPaymentPlanDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  durationMonths: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  interestRate: number;
}

export class PropertyFeatureDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  icon: string;
}

export class PropertyMediaDto {
  @ApiProperty({ enum: MediaType })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string;
}

export class MapConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  src: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  width: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  height: string;
}

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subtype: string;

  @ApiProperty({ enum: PropertyStatus })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AgriculturalFeeDto)
  @IsOptional()
  agriculturalFee?: AgriculturalFeeDto;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredDocuments?: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsInt()
  stateId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nearbyLandmark: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  overdueInterestRate: number;

  @ApiProperty()
  @IsInt()
  @Min(1)
  paymentCycle: number;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => SalesDiscountDto)
  @IsOptional()
  salesDiscount?: SalesDiscountDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => MapConfigDto)
  @IsOptional()
  mapConfig?: MapConfigDto;

  @ApiProperty({ type: [PropertyUnitPricingDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyUnitPricingDto)
  @ArrayMinSize(1)
  unitPricing: PropertyUnitPricingDto[];

  @ApiProperty({ type: [PropertyPaymentPlanDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyPaymentPlanDto)
  @ArrayMinSize(1)
  paymentPlans: PropertyPaymentPlanDto[];

  @ApiPropertyOptional({ type: [PropertyFeatureDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyFeatureDto)
  @IsOptional()
  features?: PropertyFeatureDto[];

  @ApiProperty({ type: [PropertyMediaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyMediaDto)
  media: PropertyMediaDto[];
}
