import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DisbursementConfigService } from './disbursement-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AddExceptionDto } from './dto/add-exception.dto';
import { ConfigResponseDto, ExceptionUserDto } from './dto/config-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermission } from '../common/decorators/require-permission.decorator';

@ApiTags('Disbursement Config')
@Controller('disbursement-config')
export class DisbursementConfigController {
  constructor(private configService: DisbursementConfigService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('disbursements', 'manage')
  @ApiOperation({
    summary: 'Get current disbursement configuration (admin only)',
    description: 'Returns the current auto-disbursement configuration including mode and exception list',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: ConfigResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getConfig() {
    return this.configService.getConfig();
  }

  @Put()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('disbursements', 'manage')
  @ApiOperation({
    summary: 'Update disbursement configuration mode (admin only)',
    description: 'Updates the auto-disbursement mode (ALL_EXCEPT or NONE_EXCEPT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration updated successfully',
    type: ConfigResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateConfig(@Body() updateDto: UpdateConfigDto) {
    return this.configService.updateConfig(updateDto);
  }

  @Post('exceptions')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('disbursements', 'manage')
  @ApiOperation({
    summary: 'Add user to exception list (admin only)',
    description: 'Adds a user to the auto-disbursement exception list',
  })
  @ApiResponse({
    status: 200,
    description: 'User added to exception list successfully',
    type: ConfigResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - user already in exception list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  addException(@Body() addExceptionDto: AddExceptionDto) {
    return this.configService.addException(addExceptionDto);
  }

  @Delete('exceptions/:userId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('disbursements', 'manage')
  @ApiOperation({
    summary: 'Remove user from exception list (admin only)',
    description: 'Removes a user from the auto-disbursement exception list',
  })
  @ApiResponse({
    status: 200,
    description: 'User removed from exception list successfully',
    type: ConfigResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - user not in exception list' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Configuration not found' })
  removeException(@Param('userId') userId: string) {
    return this.configService.removeException(userId);
  }

  @Get('exceptions')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermission('disbursements', 'manage')
  @ApiOperation({
    summary: 'List exception users (admin only)',
    description: 'Returns list of users in the auto-disbursement exception list, sorted by latest added first',
  })
  @ApiResponse({
    status: 200,
    description: 'Exception list retrieved successfully',
    type: [ExceptionUserDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  listExceptions(@Query('search') search?: string) {
    return this.configService.listExceptions(search);
  }
}
