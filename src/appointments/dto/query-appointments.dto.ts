import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAppointmentsDto {
  @ApiProperty({ description: 'Page number', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Filter by property ID', required: false })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiProperty({ description: 'Filter by schedule ID', required: false })
  @IsOptional()
  @IsString()
  scheduleId?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['BOOKED', 'CANCELLED', 'ALL'],
    required: false,
    example: 'BOOKED'
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Filter upcoming appointments only', required: false, example: true })
  @IsOptional()
  @Type(() => Boolean)
  upcomingOnly?: boolean;
}
