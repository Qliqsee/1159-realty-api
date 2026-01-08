import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class DeleteUserResponseDto {
  @ApiProperty({ example: 'User deleted successfully' })
  message: string;
}

export class RemoveRoleResponseDto {
  @ApiProperty({ example: 'Role removed from user successfully' })
  message: string;
}
