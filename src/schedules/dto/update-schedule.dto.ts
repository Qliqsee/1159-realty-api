import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateScheduleDto {
  @ApiProperty({
    description: 'Title of the schedule',
    example: 'Property Inspection',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Date and time of the schedule',
    example: '2026-01-15T10:00:00Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  dateTime?: string;

  @ApiProperty({
    description: 'Location of the appointment',
    example: 'Property Site, 123 Main Street',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Optional message or instructions',
    example: 'Bring valid ID and comfortable shoes',
    required: false
  })
  @IsOptional()
  @IsString()
  message?: string;
}
