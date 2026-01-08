import { ApiProperty } from '@nestjs/swagger';

export class SyncSegmentResponseDto {
  @ApiProperty({ example: 'uuid' })
  segmentId: string;

  @ApiProperty({ example: 'Lagos Male Property Buyers' })
  segmentName: string;

  @ApiProperty({ example: 'brevo-list-id-123' })
  brevoListId: string;

  @ApiProperty({ example: 45 })
  usersSynced: number;

  @ApiProperty({ example: 'SUCCESS' })
  status: string;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  syncedAt: Date;

  @ApiProperty({ example: 'Synced successfully to Brevo' })
  message: string;
}
