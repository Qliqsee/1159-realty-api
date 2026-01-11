import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({ description: 'Role ID to assign', example: 'uuid-role-id' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
