import {
  Controller,
  Get,
  Patch,
  Delete,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateData: { name?: string; email?: string }) {
    return this.usersService.update(id, updateData);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  assignRole(@Param('id') userId: string, @Body('roleId') roleId: string) {
    return this.usersService.assignRole(userId, roleId);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  removeRole(@Param('id') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.removeRole(userId, roleId);
  }

  @Get(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getUserPermissions(@Param('id') id: string) {
    return this.usersService.getUserPermissions(id);
  }
}
