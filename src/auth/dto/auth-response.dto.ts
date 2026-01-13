import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClientResponseDto } from '../../clients/dto/client-response.dto';
import { AdminResponseDto } from '../../admins/dto/admin-response.dto';

export class TokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}

export class AuthResponseDto {
  @ApiPropertyOptional({
    description: 'Client profile with capabilities (null if admin login)',
    type: () => ClientResponseDto,
  })
  client: ClientResponseDto | null;

  @ApiPropertyOptional({
    description: 'Admin profile with capabilities (null if client login)',
    type: () => AdminResponseDto,
  })
  admin: AdminResponseDto | null;

  @ApiProperty({
    description: 'JWT tokens',
    type: () => TokensDto,
  })
  tokens: TokensDto;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}
