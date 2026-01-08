import { ApiProperty } from '@nestjs/swagger';
import { InterestResponseDto } from './interest-response.dto';

export class PaginationMetaDto {
  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 15 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPrevPage: boolean;
}

export class PaginatedInterestResponseDto {
  @ApiProperty({ type: [InterestResponseDto] })
  data: InterestResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
