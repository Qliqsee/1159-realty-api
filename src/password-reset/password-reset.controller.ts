import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';
import {
  RequestResetDto,
  RequestResetResponseDto,
} from './dto/request-reset.dto';
import {
  VerifyTokenResponseDto,
} from './dto/verify-token.dto';
import {
  ResetPasswordDto,
  ResetPasswordResponseDto,
} from './dto/reset-password.dto';

@ApiTags('Authentication')
@Controller('password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
    type: RequestResetResponseDto,
  })
  async requestReset(
    @Body() requestResetDto: RequestResetDto,
  ): Promise<RequestResetResponseDto> {
    return this.passwordResetService.requestReset(requestResetDto.email);
  }

  @Get('verify/:token')
  @ApiOperation({ summary: 'Verify reset token validity' })
  @ApiResponse({
    status: 200,
    description: 'Token validity check result',
    type: VerifyTokenResponseDto,
  })
  async verifyToken(@Param('token') token: string): Promise<VerifyTokenResponseDto> {
    return this.passwordResetService.verifyToken(token);
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponseDto> {
    return this.passwordResetService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }
}
