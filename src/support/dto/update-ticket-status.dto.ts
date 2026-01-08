import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketStatus {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

export class UpdateTicketStatusDto {
  @ApiProperty({
    example: 'CLOSED',
    description: 'Ticket status',
    enum: TicketStatus,
  })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}
