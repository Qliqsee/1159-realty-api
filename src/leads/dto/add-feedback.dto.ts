import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFeedbackDto {
  @ApiProperty({
    example: 'Client is very interested in agricultural land. Prefers properties near the river.',
    description: 'Feedback comment about the lead/client interaction',
  })
  @IsString()
  @IsNotEmpty()
  comment: string;
}
