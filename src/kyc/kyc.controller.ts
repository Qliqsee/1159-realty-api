import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
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
  ApiQuery,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../common/guards/email-verified.guard';
import { SavePersonalStepDto } from './dto/save-personal-step.dto';
import { SaveAddressStepDto } from './dto/save-address-step.dto';
import { SaveOccupationStepDto } from './dto/save-occupation-step.dto';
import { SaveIdentityStepDto } from './dto/save-identity-step.dto';
import { SaveNextOfKinStepDto } from './dto/save-next-of-kin-step.dto';
import { SaveBankStepDto } from './dto/save-bank-step.dto';
import { SubmitKycResponseDto } from './dto/submit-kyc.dto';
import { RejectKycDto, RejectKycResponseDto } from './dto/reject-kyc.dto';
import { ApproveKycResponseDto } from './dto/approve-kyc.dto';
import { KycStatus } from '@prisma/client';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  // User Endpoints

  @Post('personal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update personal information step' })
  @ApiResponse({ status: 200, description: 'Personal step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async savePersonalStep(@Req() req, @Body() dto: SavePersonalStepDto) {
    return this.kycService.savePersonalStep(req.user.userId, dto);
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update address information step' })
  @ApiResponse({ status: 200, description: 'Address step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveAddressStep(@Req() req, @Body() dto: SaveAddressStepDto) {
    return this.kycService.saveAddressStep(req.user.userId, dto);
  }

  @Post('occupation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update occupation information step' })
  @ApiResponse({ status: 200, description: 'Occupation step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveOccupationStep(@Req() req, @Body() dto: SaveOccupationStepDto) {
    return this.kycService.saveOccupationStep(req.user.userId, dto);
  }

  @Post('identity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update identity information step' })
  @ApiResponse({ status: 200, description: 'Identity step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveIdentityStep(@Req() req, @Body() dto: SaveIdentityStepDto) {
    return this.kycService.saveIdentityStep(req.user.userId, dto);
  }

  @Post('next-of-kin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update next of kin information step' })
  @ApiResponse({ status: 200, description: 'Next of kin step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveNextOfKinStep(@Req() req, @Body() dto: SaveNextOfKinStepDto) {
    return this.kycService.saveNextOfKinStep(req.user.userId, dto);
  }

  @Post('bank')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update bank information step' })
  @ApiResponse({ status: 200, description: 'Bank step saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveBankStep(@Req() req, @Body() dto: SaveBankStepDto) {
    return this.kycService.saveBankStep(req.user.userId, dto);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYC for review' })
  @ApiResponse({
    status: 200,
    description: 'KYC submitted successfully',
    type: SubmitKycResponseDto,
  })
  @ApiResponse({ status: 400, description: 'All steps must be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitKyc(@Req() req): Promise<SubmitKycResponseDto> {
    await this.kycService.submitKyc(req.user.userId);
    return { message: 'KYC submitted for review successfully' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user KYC' })
  @ApiResponse({ status: 200, description: 'Current user KYC' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyKyc(@Req() req) {
    return this.kycService.getMyKyc(req.user.userId);
  }

  // Admin Endpoints

  @Get()
  @ApiOperation({ summary: 'List all KYCs (Admin only)' })
  @ApiQuery({ name: 'status', enum: KycStatus, required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of KYCs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listKycs(
    @Query('status') status?: KycStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.kycService.listKycs(status, pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KYC by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'KYC details' })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycById(@Param('id') id: string) {
    return this.kycService.getKycById(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get KYC submission history (Admin only)' })
  @ApiResponse({ status: 200, description: 'KYC history' })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycHistory(@Param('id') id: string) {
    return this.kycService.getKycHistory(id);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve KYC (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC approved successfully',
    type: ApproveKycResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Only submitted KYCs can be approved' })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approveKyc(
    @Param('id') id: string,
    @Req() req,
  ): Promise<ApproveKycResponseDto> {
    await this.kycService.approveKyc(id, req.user.userId);
    return { message: 'KYC approved successfully' };
  }

  @Patch(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject KYC (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC rejected successfully',
    type: RejectKycResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Only submitted KYCs can be rejected' })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectKyc(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: RejectKycDto,
  ): Promise<RejectKycResponseDto> {
    await this.kycService.rejectKyc(id, req.user.userId, dto.reason);
    return { message: 'KYC rejected successfully' };
  }
}
