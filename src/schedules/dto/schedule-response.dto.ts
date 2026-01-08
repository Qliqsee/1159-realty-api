import { ApiProperty } from '@nestjs/swagger';

export class ScheduleResponseDto {
  @ApiProperty({ description: 'Schedule ID' })
  id: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Property name', required: false })
  propertyName?: string;

  @ApiProperty({ description: 'Date and time of the schedule' })
  dateTime: Date;

  @ApiProperty({ description: 'Location of the appointment' })
  location: string;

  @ApiProperty({ description: 'Optional message or instructions', required: false })
  message?: string;

  @ApiProperty({ description: 'Number of appointments booked', required: false })
  appointmentsCount?: number;

  @ApiProperty({ description: 'Created by user ID' })
  createdBy: string;

  @ApiProperty({ description: 'Creator name', required: false })
  creatorName?: string;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
