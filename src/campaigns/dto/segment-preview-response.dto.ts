import { ApiProperty } from '@nestjs/swagger';
import { TrafficSource } from '../../common/enums';

class PreviewUserDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '+2348012345678' })
  phone: string;

  @ApiProperty({ example: 'MALE' })
  gender: string;

  @ApiProperty({ example: 'Nigeria' })
  country: string;

  @ApiProperty({ example: 'Lagos' })
  state: string;

  @ApiProperty({ example: TrafficSource.INSTAGRAM, enum: TrafficSource, required: false })
  referralSource?: TrafficSource | null;
}

export class SegmentPreviewResponseDto {
  @ApiProperty({ type: [PreviewUserDto] })
  data: PreviewUserDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}
