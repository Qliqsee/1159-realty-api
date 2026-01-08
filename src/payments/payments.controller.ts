import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { PaymentResponseDto, PaymentVerificationDto } from './dto/payment-response.dto';
import { PaymentLinkResponseDto } from './dto/payment-link-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('initialize')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Initialize payment for an invoice',
    description: 'Creates a Paystack payment link for an invoice. Validates sequential payment, checks invoice status, and calculates total amount including overdue fees if applicable.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initialized successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - invoice already paid or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  initializePayment(
    @Body() initializeDto: InitializePaymentDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.id;
    return this.paymentsService.initializePayment(initializeDto, userId);
  }

  @Get('verify/:reference')
  @ApiOperation({
    summary: 'Verify payment status',
    description: 'Verifies a payment transaction with Paystack using the payment reference',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment verification successful',
    type: PaymentVerificationDto,
  })
  @ApiResponse({ status: 400, description: 'Payment verification failed' })
  verifyPayment(@Param('reference') reference: string) {
    return this.paymentsService.verifyPayment(reference);
  }

  @Get('payment-links/:token')
  @ApiOperation({
    summary: 'Get payment link details by token (public)',
    description: 'Retrieves invoice and property details for a payment link. No authentication required. Validates link is active and not expired.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment link details retrieved successfully',
    type: PaymentLinkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment link not found' })
  @ApiResponse({ status: 400, description: 'Payment link expired or inactive' })
  getPaymentLinkByToken(@Param('token') token: string) {
    return this.paymentsService.getPaymentLinkByToken(token);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Paystack webhook endpoint',
    description: 'Receives payment notifications from Paystack. Automatically updates invoice status, creates commissions, and deactivates payment links upon successful payment.',
  })
  @ApiHeader({
    name: 'x-paystack-signature',
    description: 'Paystack webhook signature for verification',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    await this.paymentsService.handleWebhook(payload, signature);
    return { message: 'Webhook received' };
  }
}
