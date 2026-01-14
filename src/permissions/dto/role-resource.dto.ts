import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class AttachResourceDto {
  @ApiProperty({ example: 'uuid-of-resource' })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({ example: ['view', 'create', 'update', 'delete'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  actions: string[];
}
