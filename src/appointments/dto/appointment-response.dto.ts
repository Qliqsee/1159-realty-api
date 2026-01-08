import { ApiProperty } from '@nestjs/swagger';

export class AppointmentResponseDto {
  @ApiProperty({ description: 'Appointment ID' })
  id: string;

  @ApiProperty({ description: 'Schedule ID' })
  scheduleId: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId: string;

  @ApiProperty({ description: 'Property name', required: false })
  propertyName?: string;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Client name', required: false })
  clientName?: string;

  @ApiProperty({ description: 'Client email', required: false })
  clientEmail?: string;

  @ApiProperty({ description: 'Schedule date and time', required: false })
  scheduleDateTime?: Date;

  @ApiProperty({ description: 'Schedule location', required: false })
  scheduleLocation?: string;

  @ApiProperty({ description: 'Schedule message', required: false })
  scheduleMessage?: string;

  @ApiProperty({ description: 'Appointment status', enum: ['BOOKED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ description: 'Booked at' })
  bookedAt: Date;

  @ApiProperty({ description: 'Cancelled at', required: false })
  cancelledAt?: Date;

  @ApiProperty({ description: 'Created at' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at' })
  updatedAt: Date;
}
