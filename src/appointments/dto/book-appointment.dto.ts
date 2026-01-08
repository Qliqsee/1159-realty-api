import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BookAppointmentDto {
  @ApiProperty({
    description: 'Schedule ID to book',
    example: 'uuid'
  })
  @IsNotEmpty()
  @IsString()
  scheduleId: string;
}
