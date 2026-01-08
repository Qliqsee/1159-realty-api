import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseLeadDto {
  @ApiProperty({
    example: 'existing.client@example.com',
    description: 'Email of existing client in the system to link this lead to',
  })
  @IsEmail()
  @IsNotEmpty()
  clientEmail: string;
}
