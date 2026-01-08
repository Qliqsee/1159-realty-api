import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'Role ID to assign', example: 'clx123abc' })
  @IsString()
  @IsNotEmpty()
  roleId: string;
}
