import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  appContext: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  createdAt: Date;
}

export class DeleteRoleResponseDto {
  @ApiProperty({ example: 'Role deleted successfully' })
  message: string;
}

export class RemovePermissionResponseDto {
  @ApiProperty({ example: 'Permission removed from role successfully' })
  message: string;
}
