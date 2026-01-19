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
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { SavePersonalStepDto } from './dto/save-personal-step.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { SaveAddressStepDto } from './dto/save-address-step.dto';
import { SaveOccupationStepDto } from './dto/save-occupation-step.dto';
import { SaveIdentityStepDto } from './dto/save-identity-step.dto';
import { SaveNextOfKinStepDto } from './dto/save-next-of-kin-step.dto';
import { SaveBankStepDto } from './dto/save-bank-step.dto';
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
import { ClientResponseDto } from '../clients/dto/client-response.dto';
import { GetPersonalInfoResponseDto } from './dto/get-personal-info-response.dto';
import { GetOccupationInfoResponseDto } from './dto/get-occupation-info-response.dto';
import { GetNextOfKinInfoResponseDto } from './dto/get-next-of-kin-info-response.dto';
import { GetAddressInfoResponseDto } from './dto/get-address-info-response.dto';
import { GetIdentityInfoResponseDto } from './dto/get-identity-info-response.dto';
import { GetBankInfoResponseDto } from './dto/get-bank-info-response.dto';
import { KycRejectionsResponseDto } from './dto/kyc-rejections-response.dto';
import { KycRejectionsQueryDto } from './dto/kyc-rejections-query.dto';
import { KycHistoryResponseDto } from './dto/kyc-history-response.dto';
import { KycHistoryQueryDto } from './dto/kyc-history-query.dto';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  // Client Endpoints

  @Post('personal/onboarding')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save personal information during onboarding (first time only)',
    description: 'This endpoint is only for initial onboarding. After onboarding is complete, use POST /kyc/personal to update personal information.'
  })
  @ApiResponse({
    status: 200,
    description: 'Personal step saved successfully',
    type: ClientResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Onboarding has been completed already' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async savePersonalStep(
    @Req() req,
    @Body() dto: SavePersonalStepDto,
  ): Promise<ClientResponseDto> {
    return this.kycService.savePersonalStep(req.user.userId, dto);
  }

  @Post('personal')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update personal information after onboarding',
    description: 'This endpoint updates personal information in draft after onboarding is complete. Changes will be applied to your profile after KYC approval.'
  })
  @ApiResponse({
    status: 200,
    description: 'Personal information updated successfully',
    type: SavePersonalStepResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Please complete onboarding first' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updatePersonalInfo(
    @Req() req,
    @Body() dto: UpdatePersonalInfoDto,
  ): Promise<SavePersonalStepResponseDto> {
    return this.kycService.updatePersonalInfo(req.user.userId, dto);
  }

  @Post('address')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update address information step' })
  @ApiResponse({
    status: 200,
    description: 'Address step saved successfully',
    type: SaveAddressStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveAddressStep(
    @Req() req,
    @Body() dto: SaveAddressStepDto,
  ): Promise<SaveAddressStepResponseDto> {
    return this.kycService.saveAddressStep(req.user.userId, dto);
  }

  @Post('occupation')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update occupation information step' })
  @ApiResponse({
    status: 200,
    description: 'Occupation step saved successfully',
    type: SaveOccupationStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveOccupationStep(
    @Req() req,
    @Body() dto: SaveOccupationStepDto,
  ): Promise<SaveOccupationStepResponseDto> {
    return this.kycService.saveOccupationStep(req.user.userId, dto);
  }

  @Post('identity')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update identity information step' })
  @ApiResponse({
    status: 200,
    description: 'Identity step saved successfully',
    type: SaveIdentityStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveIdentityStep(
    @Req() req,
    @Body() dto: SaveIdentityStepDto,
  ): Promise<SaveIdentityStepResponseDto> {
    return this.kycService.saveIdentityStep(req.user.userId, dto);
  }

  @Post('next-of-kin')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update next of kin information step' })
  @ApiResponse({
    status: 200,
    description: 'Next of kin step saved successfully',
    type: SaveNextOfKinStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveNextOfKinStep(
    @Req() req,
    @Body() dto: SaveNextOfKinStepDto,
  ): Promise<SaveNextOfKinStepResponseDto> {
    return this.kycService.saveNextOfKinStep(req.user.userId, dto);
  }

  @Post('bank')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save/update bank information step' })
  @ApiResponse({
    status: 200,
    description: 'Bank step saved successfully',
    type: SaveBankStepResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async saveBankStep(
    @Req() req,
    @Body() dto: SaveBankStepDto,
  ): Promise<SaveBankStepResponseDto> {
    return this.kycService.saveBankStep(req.user.userId, dto);
  }

  @Post('submit')
  @RequirePermissions('kyc:manage')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit KYC for review' })
  @ApiResponse({
    status: 200,
    description: 'KYC submitted successfully',
    type: GetMyKycResponseDto,
  })
  @ApiResponse({ status: 400, description: 'All steps must be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitKyc(@Req() req): Promise<GetMyKycResponseDto> {
    return this.kycService.submitKyc(req.user.userId);
  }

  @Get('personal')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get personal information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Personal information retrieved successfully',
    type: GetPersonalInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyPersonalInfo(@Req() req): Promise<GetPersonalInfoResponseDto | null> {
    return this.kycService.getMyPersonalInfo(req.user.userId);
  }

  @Get('occupation')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get occupation information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Occupation information retrieved successfully',
    type: GetOccupationInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyOccupationInfo(@Req() req): Promise<GetOccupationInfoResponseDto | null> {
    return this.kycService.getMyOccupationInfo(req.user.userId);
  }

  @Get('next-of-kin')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get next of kin information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Next of kin information retrieved successfully',
    type: GetNextOfKinInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyNextOfKinInfo(@Req() req): Promise<GetNextOfKinInfoResponseDto | null> {
    return this.kycService.getMyNextOfKinInfo(req.user.userId);
  }

  @Get('address')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get address information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Address information retrieved successfully',
    type: GetAddressInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyAddressInfo(@Req() req): Promise<GetAddressInfoResponseDto | null> {
    return this.kycService.getMyAddressInfo(req.user.userId);
  }

  @Get('identity')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get identity information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Identity information retrieved successfully',
    type: GetIdentityInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyIdentityInfo(@Req() req): Promise<GetIdentityInfoResponseDto | null> {
    return this.kycService.getMyIdentityInfo(req.user.userId);
  }

  @Get('bank')
  @RequirePermissions('kyc:view_own')
  @ApiOperation({ summary: 'Get bank information for current user' })
  @ApiResponse({
    status: 200,
    description: 'Bank information retrieved successfully',
    type: GetBankInfoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async getMyBankInfo(@Req() req): Promise<GetBankInfoResponseDto | null> {
    return this.kycService.getMyBankInfo(req.user.userId);
  }

  @Get('me')
  @RequirePermissions('kyc:view_own')
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
  @RequirePermissions('kyc:view_own')
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
  @RequirePermissions('kyc:view_all')
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
      query.limit || 10,
    );
  }

  @Get(':id')
  @RequirePermissions('kyc:view_all')
  @ApiOperation({ summary: 'Get KYC by ID with full details (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC details (use /kyc/:id/history and /kyc/:id/rejections for history and rejections)',
    type: KycDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycById(@Param('id') id: string): Promise<KycDetailResponseDto> {
    return this.kycService.getKycById(id);
  }

  @Get(':id/history')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Get KYC submission history with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC history with pagination',
    type: KycHistoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycHistory(
    @Param('id') id: string,
    @Query() query: KycHistoryQueryDto,
  ): Promise<KycHistoryResponseDto> {
    return this.kycService.getKycHistory(
      id,
      query.status,
      query.submissionDateFrom,
      query.submissionDateTo,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get(':id/rejections')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Get KYC rejection reasons with pagination (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC rejections with pagination',
    type: KycRejectionsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycRejections(
    @Param('id') id: string,
    @Query() query: KycRejectionsQueryDto,
  ): Promise<KycRejectionsResponseDto> {
    return this.kycService.getKycRejections(
      id,
      query.search,
      query.createdFrom,
      query.createdTo,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('client/:clientId')
  @RequirePermissions('kyc:review')
  @ApiOperation({ summary: 'Get KYC by client ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC details for client',
    type: GetMyKycResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Client or KYC not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getKycByClientId(@Param('clientId') clientId: string): Promise<GetMyKycResponseDto> {
    return this.kycService.getKycByClientId(clientId);
  }

  @Patch(':id/approve')
  @RequirePermissions('kyc:review')
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
  @RequirePermissions('kyc:review')
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
