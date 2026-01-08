import { ApiProperty } from '@nestjs/swagger';
import { SegmentResponseDto } from './segment-response.dto';

export class PaginatedSegmentResponseDto {
  @ApiProperty({ type: [SegmentResponseDto] })
  data: SegmentResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}
