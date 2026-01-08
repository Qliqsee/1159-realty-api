import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInterestDto {
  @ApiProperty({
    description: 'Property ID to express interest in',
    example: 'clx123abc456def789',
  })
  @IsString()
  @IsNotEmpty()
  propertyId: string;

  @ApiPropertyOptional({
    description: 'Optional message from client about their interest',
    example: 'I am interested in purchasing this property for investment purposes.',
  })
  @IsString()
  @IsOptional()
  message?: string;
}
