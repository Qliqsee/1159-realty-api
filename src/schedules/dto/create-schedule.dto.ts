import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Property ID for the schedule',
    example: 'uuid'
  })
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @ApiProperty({
    description: 'Date and time of the schedule',
    example: '2026-01-15T10:00:00Z'
  })
  @IsNotEmpty()
  @IsDateString()
  dateTime: string;

  @ApiProperty({
    description: 'Location of the appointment',
    example: 'Property Site, 123 Main Street'
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Optional message or instructions',
    example: 'Bring valid ID and comfortable shoes',
    required: false
  })
  @IsOptional()
  @IsString()
  message?: string;
}
