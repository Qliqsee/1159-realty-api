import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketCategory {
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  PROPERTY = 'PROPERTY',
  ENROLLMENT = 'ENROLLMENT',
  KYC = 'KYC',
  GENERAL = 'GENERAL',
  OTHER = 'OTHER',
}

export class CreateTicketDto {
  @ApiProperty({
    example: 'TECHNICAL',
    description: 'Ticket category',
    enum: TicketCategory,
  })
  @IsEnum(TicketCategory)
  @IsNotEmpty()
  category: TicketCategory;

  @ApiProperty({
    example: 'I am unable to access my dashboard and keep getting an error message.',
    description: 'Reason for opening the ticket',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    description: 'Array of attachment URLs',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}
