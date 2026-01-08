import { ApiProperty } from '@nestjs/swagger';
import { SalesTargetResponseDto } from './sales-target-response.dto';

class BatchCreateError {
  @ApiProperty({ description: 'Index in the array' })
  index: number;

  @ApiProperty({ description: 'Email from the request' })
  email: string;

  @ApiProperty({ description: 'Error message' })
  error: string;
}

export class BatchCreateResponseDto {
  @ApiProperty({ description: 'Successfully created targets', type: [SalesTargetResponseDto] })
  success: SalesTargetResponseDto[];

  @ApiProperty({ description: 'Failed targets with error messages', type: [BatchCreateError] })
  failures: BatchCreateError[];

  @ApiProperty({ description: 'Total count of successful creations' })
  successCount: number;

  @ApiProperty({ description: 'Total count of failures' })
  failureCount: number;
}
