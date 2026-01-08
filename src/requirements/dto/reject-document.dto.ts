import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectDocumentDto {
  @ApiProperty({
    example: 'Document is not clear enough. Please upload a higher quality image.',
    description: 'Rejection reason',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
