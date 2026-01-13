import { Controller, Post, Get, Body, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { AdminSignUpDto } from './dto/admin-signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto, RefreshTokenDto, RefreshTokenResponseDto, GetMeResponseDto } from './dto/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleAdminAuthGuard } from './guards/google-admin-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // CLIENT SIGNUP
  @Post('signup')
  @ApiOperation({ summary: 'Client sign up with email and password' })
  @ApiResponse({
    status: 201,
    description: 'Client successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  // ADMIN SIGNUP
  @Post('admin/signup')
  @ApiOperation({ summary: 'Admin sign up with email and password (Agent role by default)' })
  @ApiResponse({
    status: 201,
    description: 'Admin successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  async adminSignUp(@Body() adminSignUpDto: AdminSignUpDto) {
    return this.authService.adminSignUp(adminSignUpDto);
  }

  // UNIFIED LOGIN FOR BOTH ADMIN AND CLIENT
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password (Works for both admin and client)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account has been banned' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    return this.authService.login(req.user);
  }

  // CLIENT GOOGLE OAUTH
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow for clients' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAuth() {
    // Initiates Google OAuth flow for clients
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback handler for clients' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&userType=client`
    );
  }

  // ADMIN GOOGLE OAUTH
  @Get('google/admin')
  @UseGuards(GoogleAdminAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow for admins' })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleAdminAuth() {
    // Initiates Google OAuth flow for admins
  }

  @Get('google/admin/callback')
  @UseGuards(GoogleAdminAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback handler for admins' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens' })
  async googleAdminAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect to frontend with tokens
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}&userType=admin`
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'New tokens generated',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  @ApiResponse({ status: 403, description: 'Account has been banned' })
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile with capabilities',
    type: GetMeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: Request) {
    const user: any = req.user;
    return this.authService.getMe(user.userId);
  }
}
