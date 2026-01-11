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
  Query,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto, MyClientsQueryDto } from './dto/user-query.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import {
  UserResponseDto,
  DeleteUserResponseDto,
  RemoveRoleResponseDto,
  UserDetailsResponseDto,
  UserStatsResponseDto,
  MyStatsResponseDto,
  ReferralInfoResponseDto,
} from './dto/user-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * DEPRECATED: Most endpoints are commented out because UsersService methods are unavailable
   * after schema migration. User fields moved to Admin/Client tables.
   * These endpoints will be replaced by Admin and Client module endpoints.
   */

  /* COMMENTED OUT - Schema migration: UsersService methods unavailable
  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user profile with full details' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserDetailsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    return this.usersService.getProfile(req.user['id']);
  }

  @Get('referral-id')
  @ApiOperation({ summary: 'Get user referral information' })
  @ApiResponse({
    status: 200,
    description: 'Referral information retrieved successfully',
    type: ReferralInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getReferralInfo(@Req() req: Request) {
    return this.usersService.getReferralInfo(req.user['id']);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('my-stats')
  @UseGuards(RolesGuard)
  @Roles('agent')
  @ApiOperation({ summary: 'Get my client statistics (agent only)' })
  @ApiResponse({
    status: 200,
    description: 'Agent client statistics retrieved successfully',
    type: MyStatsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getMyStats(@Req() req: Request) {
    return this.usersService.getMyStats(req.user['id']);
  }

  @Get('my-clients')
  @UseGuards(RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'Get my clients with pagination, search, and filters (agent only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of agent clients',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getMyClients(@Req() req: Request, @Query() query: MyClientsQueryDto) {
    return this.usersService.getMyClients(req.user['id'], query);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all users with pagination, search, and filters (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated users list',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with full details' })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully',
    type: UserDetailsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const currentUser = req.user;
    const roles = currentUser['roles'] || [];

    // Admin can access any user
    if (roles.includes('admin')) {
      return this.usersService.findOne(id);
    }

    // Agent can only access their clients
    if (roles.includes('agent')) {
      const canAccess = await this.usersService.canAgentAccessClient(
        currentUser['id'],
        id
      );

      if (!canAccess) {
        throw new ForbiddenException(
          'You can only access users that are your clients'
        );
      }

      return this.usersService.findOne(id);
    }

    // User can only access their own profile
    if (id !== currentUser['id']) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user details (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateData: UpdateUserDto) {
    return this.usersService.update(id, updateData);
  }
  */ // END COMMENTED OUT - Schema migration

  // These endpoints still work with the new schema

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    type: DeleteUserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Assign role to user (admin only)' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User already has this role',
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  assignRole(@Param('id') userId: string, @Body() body: AssignRoleDto) {
    return this.usersService.assignRole(userId, body.roleId);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Remove role from user (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
    type: RemoveRoleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User does not have this role' })
  removeRole(@Param('id') userId: string, @Param('roleId') roleId: string) {
    return this.usersService.removeRole(userId, roleId);
  }

  @Get(':id/permissions')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get all permissions for a user (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns user permissions list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserPermissions(@Param('id') id: string) {
    return this.usersService.getUserPermissions(id);
  }

  /* COMMENTED OUT - Schema migration: bank account fields moved to Admin/Client tables
  @Patch('me/bank-account')
  @ApiOperation({ summary: 'Update or add bank account details for authenticated user' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid bank details' })
  updateMyBankAccount(@Req() req: Request, @Body() bankData: any) {
    const userId = (req.user as any).id;
    return this.usersService.updateBankAccount(userId, bankData);
  }

  @Get('me/bank-account')
  @ApiOperation({ summary: 'Get bank account details for authenticated user' })
  @ApiResponse({ status: 200, description: 'Bank account retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bank account not configured' })
  getMyBankAccount(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.getBankAccount(userId);
  }

  @Delete('me/bank-account')
  @ApiOperation({ summary: 'Delete bank account details for authenticated user' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteMyBankAccount(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.usersService.deleteBankAccount(userId);
  }
  */ // END COMMENTED OUT - Bank account endpoints
}
