import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { EmailService } from './email.service';
import { VerifyOtpDto, VerifyOtpResponseDto } from './dto/verify-otp.dto';
import { SendOtpResponseDto } from './dto/send-otp.dto';
import { ResendOtpResponseDto } from './dto/resend-otp.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Email Verification')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to user email for verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
    type: SendOtpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email already verified or active OTP exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendOtp(@Req() req): Promise<SendOtpResponseDto> {
    const userId = req.user.userId;
    return this.emailService.sendOtp(userId);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP code' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: VerifyOtpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async verifyOtp(
    @Req() req,
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<VerifyOtpResponseDto> {
    const userId = req.user.userId;
    await this.emailService.verifyOtp(userId, verifyOtpDto.code);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-otp')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend OTP to user email' })
  @ApiResponse({
    status: 200,
    description: 'OTP resent successfully',
    type: ResendOtpResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email already verified or must wait before resending' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resendOtp(@Req() req): Promise<ResendOtpResponseDto> {
    const userId = req.user.userId;
    return this.emailService.resendOtp(userId);
  }
}
