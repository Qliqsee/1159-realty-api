import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum InterestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export class UpdatePropertyInterestDto {
  @ApiPropertyOptional({ enum: InterestStatus })
  @IsEnum(InterestStatus)
  @IsOptional()
  status?: InterestStatus;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  agentId?: string;
}
