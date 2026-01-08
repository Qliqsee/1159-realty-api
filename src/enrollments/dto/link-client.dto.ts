import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LinkClientDto {
  @ApiProperty({ description: 'Client ID to link to enrollment' })
  @IsUUID()
  @IsNotEmpty()
  clientId: string;
}
