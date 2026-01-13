import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AdminIncludeQueryDto {
  @ApiPropertyOptional({
    description: 'Include capabilities in response. Note: GET /admins/me always includes capabilities regardless of this parameter.',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeCapabilities?: boolean;
}
