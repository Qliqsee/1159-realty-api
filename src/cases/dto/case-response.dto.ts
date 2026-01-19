import { ApiProperty } from '@nestjs/swagger';
import { CaseStatus } from './case-query.dto';

class ClientInfoDto {
  @ApiProperty({ example: 'bf85511e3-0347-41bd-8d94-e0b502af7b19' })
  id: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe', required: false })
  lastName?: string;

  @ApiProperty({ example: 'Michael', required: false })
  otherName?: string;

  @ApiProperty({
    type: 'object',
    properties: {
      email: { type: 'string', example: 'user@yopmail.com' },
    },
  })
  user: {
    email: string;
  };
}

class RequirementInfoDto {
  @ApiProperty({ example: 'req-uuid-123' })
  id: string;

  @ApiProperty({ example: 'Proof of Identity' })
  title: string;
}

export class CaseResponseDto {
  @ApiProperty({ example: 'case-uuid-123' })
  id: string;

  @ApiProperty({ example: 'John Doe Documentation' })
  name: string;

  @ApiProperty({ example: 'Property Purchase Documentation' })
  title: string;

  @ApiProperty({ example: CaseStatus.PENDING, enum: CaseStatus })
  status: CaseStatus;

  @ApiProperty({ example: 'bf85511e3-0347-41bd-8d94-e0b502af7b19', required: false })
  clientId?: string;

  @ApiProperty({ example: 'prop-uuid-456', required: false })
  propertyId?: string;

  @ApiProperty({ type: ClientInfoDto, required: false })
  client?: ClientInfoDto;

  @ApiProperty({ type: [RequirementInfoDto], required: false })
  requirements?: RequirementInfoDto[];

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-08T12:00:00Z' })
  updatedAt: Date;
}
