import { ApiProperty } from '@nestjs/swagger';

export class DraftChangeDto {
  @ApiProperty({ example: 'personal', description: 'The KYC section that has changes' })
  section: string;

  @ApiProperty({ example: 'firstName', description: 'The field that changed' })
  field: string;

  @ApiProperty({ example: 'John', description: 'The previous submitted value', nullable: true })
  oldValue: any;

  @ApiProperty({ example: 'Jonathan', description: 'The current draft value' })
  newValue: any;
}
