import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRequirementDto {
  @ApiProperty({
    example: 'Valid ID Card',
    description: 'Requirement title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Upload a clear copy of your national ID card or international passport',
    description: 'Requirement description',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
