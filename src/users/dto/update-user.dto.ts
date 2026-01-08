import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;
}
