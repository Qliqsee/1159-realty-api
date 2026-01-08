import { ApiProperty } from '@nestjs/swagger';

export class ApproveDocumentDto {
  @ApiProperty({
    example: true,
    description: 'Approval confirmation',
    default: true,
  })
  approve?: boolean = true;
}
