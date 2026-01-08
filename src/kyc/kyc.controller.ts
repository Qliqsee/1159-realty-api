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
import { ApproveKycDto, ApproveKycResponseDto } from './dto/approve-kyc.dto';
import { KycStatus } from '@prisma/client';
import {
  SavePersonalStepResponseDto,
  SaveAddressStepResponseDto,
  SaveOccupationStepResponseDto,
  SaveIdentityStepResponseDto,
  SaveNextOfKinStepResponseDto,
  SaveBankStepResponseDto,
} from './dto/save-step-response.dto';
import { GetMyKycResponseDto } from './dto/get-my-kyc-response.dto';
import { ValidateKycResponseDto } from './dto/validate-kyc.dto';
import {
  ListKycsQueryDto,
  ListKycsResponseDto,
} from './dto/list-kycs.dto';
import { KycDetailResponseDto } from './dto/kyc-detail-response.dto';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  // Client Endpoints

  @Post('personal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update personal information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Personal step saved successfully',
    type: SavePersonalStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async savePersonalStep(
    @Req() req,
    @Body() dto: SavePersonalStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SavePersonalStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.savePersonalStep(req.user.userId, dto, shouldContinue);
  }

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update address information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Address step saved successfully',
    type: SaveAddressStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveAddressStep(
    @Req() req,
    @Body() dto: SaveAddressStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SaveAddressStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.saveAddressStep(req.user.userId, dto, shouldContinue);
  }

  @Post('occupation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update occupation information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Occupation step saved successfully',
    type: SaveOccupationStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveOccupationStep(
    @Req() req,
    @Body() dto: SaveOccupationStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SaveOccupationStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.saveOccupationStep(req.user.userId, dto, shouldContinue);
  }

  @Post('identity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update identity information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Identity step saved successfully',
    type: SaveIdentityStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveIdentityStep(
    @Req() req,
    @Body() dto: SaveIdentityStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SaveIdentityStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.saveIdentityStep(req.user.userId, dto, shouldContinue);
  }

  @Post('next-of-kin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update next of kin information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Next of kin step saved successfully',
    type: SaveNextOfKinStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveNextOfKinStep(
    @Req() req,
    @Body() dto: SaveNextOfKinStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SaveNextOfKinStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.saveNextOfKinStep(req.user.userId, dto, shouldContinue);
  }

  @Post('bank')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update bank information step' })
  @ApiQuery({
    name: 'continueToNext',
    required: false,
    type: Boolean,
    description: 'Whether to continue to the next step after saving (default: false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bank step saved successfully',
    type: SaveBankStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveBankStep(
    @Req() req,
    @Body() dto: SaveBankStepDto,
    @Query('continueToNext') continueToNext?: string,
  ): Promise<SaveBankStepResponseDto> {
    const shouldContinue = continueToNext === 'true';
    return this.kycService.saveBankStep(req.user.userId, dto, shouldContinue);
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
  @ApiOperation({ summary: 'Get current user KYC with draft changes' })
  @ApiResponse({
    status: 200,
    description: 'Current user KYC',
    type: GetMyKycResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyKyc(@Req() req): Promise<GetMyKycResponseDto | null> {
    return this.kycService.getMyKyc(req.user.userId);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate KYC completion before submission' })
  @ApiResponse({
    status: 200,
    description: 'Validation result with detailed errors if any',
    type: ValidateKycResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async validateKyc(@Req() req): Promise<ValidateKycResponseDto> {
    return this.kycService.validateKyc(req.user.userId);
  }

  // Admin Endpoints

  @Get()
  @ApiOperation({ summary: 'List all KYCs with filters and search (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of KYCs with pagination',
    type: ListKycsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listKycs(@Query() query: ListKycsQueryDto): Promise<ListKycsResponseDto> {
    return this.kycService.listKycs(
      query.search,
      query.status,
      query.submissionDateFrom,
      query.submissionDateTo,
      query.reviewDateFrom,
      query.reviewDateTo,
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get KYC by ID with full details (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC details with history',
    type: KycDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycById(@Param('id') id: string): Promise<KycDetailResponseDto> {
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
    @Body() dto: ApproveKycDto,
  ): Promise<ApproveKycResponseDto> {
    const kyc = await this.kycService.approveKyc(id, req.user.userId, dto.feedback);
    return {
      message: 'KYC approved successfully',
      kycId: kyc.id,
      status: kyc.status,
    };
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
    const kyc = await this.kycService.rejectKyc(
      id,
      req.user.userId,
      dto.reason,
      dto.feedback,
    );
    return {
      message: 'KYC rejected successfully',
      kycId: kyc.id,
      status: kyc.status,
    };
  }
}
