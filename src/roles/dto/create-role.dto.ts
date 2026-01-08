import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'agent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'realty' })
  @IsString()
  @IsNotEmpty()
  appContext: string;

  @ApiPropertyOptional({ example: 'Sales agent role' })
  @IsString()
  description?: string;
}
