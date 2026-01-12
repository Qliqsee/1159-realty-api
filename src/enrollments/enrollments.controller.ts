import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { QueryEnrollmentsDto } from './dto/query-enrollments.dto';
import { LinkClientDto } from './dto/link-client.dto';
import { GeneratePaymentLinkDto } from './dto/generate-payment-link.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Request } from 'express';

@ApiTags('Enrollments')
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @ApiOperation({
    summary: 'Create enrollment (admin/agent)',
    description:
      'Admin can select agent and enrollment date. Agent auto-populates own ID.',
  })
  @ApiResponse({
    status: 201,
    description: 'Enrollment created successfully',
    schema: {
      example: {
        id: 'uuid-here',
        propertyId: 'property-uuid',
        unitId: 'unit-uuid',
        agentId: 'agent-uuid',
        clientId: null,
        partnerId: null,
        paymentType: 'INSTALLMENT',
        selectedPaymentPlanId: 'plan-uuid',
        totalAmount: 5000000,
        amountPaid: 0,
        status: 'ONGOING',
        gracePeriodDaysUsed: 0,
        enrollmentDate: '2026-01-12T00:00:00.000Z',
        createdAt: '2026-01-12T10:00:00.000Z',
        updatedAt: '2026-01-12T10:00:00.000Z',
        createdBy: 'admin-uuid',
        cancelledAt: null,
        cancelledBy: null,
        suspendedAt: null,
        resumedAt: null,
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role || 'admin';
    return this.enrollmentsService.create(createEnrollmentDto, userId, userRole);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'List all enrollments (admin only)',
    description: 'Returns paginated enrollments with filters and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-here',
            propertyId: 'property-uuid',
            unitId: 'unit-uuid',
            agentId: 'agent-uuid',
            clientId: 'client-uuid',
            partnerId: null,
            paymentType: 'INSTALLMENT',
            totalAmount: 5000000,
            amountPaid: 1000000,
            status: 'ONGOING',
            enrollmentDate: '2026-01-10T00:00:00.000Z',
            createdAt: '2026-01-10T10:00:00.000Z',
            property: {
              id: 'property-uuid',
              name: 'Lekki Gardens Phase 3',
              type: 'LAND'
            },
            agent: {
              id: 'agent-uuid',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            },
            client: {
              id: 'client-uuid',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com'
            }
          }
        ],
        meta: {
          total: 150,
          page: 1,
          limit: 10,
          totalPages: 15
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll(@Query() queryDto: QueryEnrollmentsDto) {
    return this.enrollmentsService.findAll(queryDto);
  }

  @Get('my-enrollments')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'List own enrollments (agent only)',
    description: 'Returns paginated enrollments for the authenticated agent',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-here',
            propertyId: 'property-uuid',
            unitId: 'unit-uuid',
            agentId: 'agent-uuid',
            clientId: 'client-uuid',
            partnerId: null,
            paymentType: 'INSTALLMENT',
            totalAmount: 5000000,
            amountPaid: 1000000,
            status: 'ONGOING',
            enrollmentDate: '2026-01-10T00:00:00.000Z',
            createdAt: '2026-01-10T10:00:00.000Z',
            property: {
              id: 'property-uuid',
              name: 'Lekki Gardens Phase 3',
              type: 'LAND'
            },
            client: {
              id: 'client-uuid',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com'
            }
          }
        ],
        meta: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findMyEnrollments(@Query() queryDto: QueryEnrollmentsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.findAll(queryDto, userId, 'agent');
  }

  @Get('client')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('client')
  @ApiOperation({
    summary: 'List own enrollments (client only)',
    description: 'Returns paginated enrollments for the authenticated client',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollments retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'uuid-here',
            propertyId: 'property-uuid',
            unitId: 'unit-uuid',
            agentId: 'agent-uuid',
            clientId: 'client-uuid',
            paymentType: 'INSTALLMENT',
            totalAmount: 5000000,
            amountPaid: 1000000,
            status: 'ONGOING',
            enrollmentDate: '2026-01-10T00:00:00.000Z',
            createdAt: '2026-01-10T10:00:00.000Z',
            property: {
              id: 'property-uuid',
              name: 'Lekki Gardens Phase 3',
              type: 'LAND'
            }
          }
        ],
        meta: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findClientEnrollments(@Query() queryDto: QueryEnrollmentsDto, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.findAll(queryDto, userId, 'client');
  }

  @Get('dashboard')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'partner')
  @ApiOperation({
    summary: 'Get enrollment dashboard with metrics and trends',
    description: 'Returns comprehensive dashboard data including enrollments, revenue, commissions, monthly trends, and conversion rates. Role-based: agents/partners see only their own data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
    schema: {
      example: {
        totalEnrollments: 150,
        totalRevenue: 750000000,
        totalCommissions: 37500000,
        ongoingEnrollments: 80,
        completedEnrollments: 50,
        conversionRate: 15.5,
        monthlyTrends: [
          { month: '2025-08', enrollments: 12, revenue: 60000000 },
          { month: '2025-09', enrollments: 15, revenue: 75000000 },
          { month: '2025-10', enrollments: 18, revenue: 90000000 },
          { month: '2025-11', enrollments: 20, revenue: 100000000 },
          { month: '2025-12', enrollments: 22, revenue: 110000000 },
          { month: '2026-01', enrollments: 25, revenue: 125000000 }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getDashboard(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Req() req?: Request,
  ) {
    const userId = (req.user as any)?.id;
    const userRole = (req.user as any)?.role || 'admin';
    return this.enrollmentsService.getDashboard(userId, userRole, dateFrom, dateTo);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get enrollment statistics (admin only)',
    description: 'Returns enrollment counts and revenue metrics for all enrollments across the app',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalEnrollments: 150,
        ongoingEnrollments: 80,
        completedEnrollments: 50,
        suspendedEnrollments: 10,
        cancelledEnrollments: 10,
        totalRevenue: 500000000,
        collectedRevenue: 300000000,
        pendingRevenue: 200000000,
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('agentId') agentId?: string,
    @Query('propertyId') propertyId?: string,
  ) {
    return this.enrollmentsService.getStats(dateFrom, dateTo, agentId, propertyId);
  }

  @Get('stats/me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('agent')
  @ApiOperation({
    summary: 'Get my enrollment statistics (agent only)',
    description: 'Returns enrollment counts and revenue metrics for enrollments where the authenticated user is the agent. No query parameters required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalEnrollments: 25,
        ongoingEnrollments: 15,
        completedEnrollments: 8,
        suspendedEnrollments: 1,
        cancelledEnrollments: 1,
        totalRevenue: 75000000,
        collectedRevenue: 45000000,
        pendingRevenue: 30000000,
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - agent only' })
  getMyStats(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.getMyStats(userId);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent', 'client')
  @ApiOperation({
    summary: 'Get enrollment details',
    description:
      'Returns full enrollment details with invoices and commissions based on role',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment details retrieved successfully',
    schema: {
      example: {
        id: 'uuid-here',
        propertyId: 'property-uuid',
        unitId: 'unit-uuid',
        agentId: 'agent-uuid',
        clientId: 'client-uuid',
        partnerId: null,
        paymentType: 'INSTALLMENT',
        selectedPaymentPlanId: 'plan-uuid',
        totalAmount: 5000000,
        amountPaid: 1000000,
        status: 'ONGOING',
        gracePeriodDaysUsed: 2,
        enrollmentDate: '2026-01-10T00:00:00.000Z',
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-01-12T10:00:00.000Z',
        createdBy: 'admin-uuid',
        property: {
          id: 'property-uuid',
          name: 'Lekki Gardens Phase 3',
          type: 'LAND',
          location: 'Lekki, Lagos',
          pricePerUnit: 5000000
        },
        agent: {
          id: 'agent-uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phoneNumber: '08012345678'
        },
        client: {
          id: 'client-uuid',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phoneNumber: '08087654321'
        },
        invoices: [
          {
            id: 'invoice-uuid-1',
            enrollmentId: 'uuid-here',
            installmentNumber: 1,
            amount: 1000000,
            dueDate: '2026-01-10T00:00:00.000Z',
            status: 'PAID',
            paidAt: '2026-01-10T12:00:00.000Z'
          },
          {
            id: 'invoice-uuid-2',
            enrollmentId: 'uuid-here',
            installmentNumber: 2,
            amount: 1000000,
            dueDate: '2026-02-10T00:00:00.000Z',
            status: 'PENDING',
            paidAt: null
          }
        ],
        commissions: [
          {
            id: 'commission-uuid',
            enrollmentId: 'uuid-here',
            agentId: 'agent-uuid',
            amount: 250000,
            status: 'PENDING',
            createdAt: '2026-01-10T10:00:00.000Z'
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to this enrollment' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    const userRole = (req.user as any).role || 'admin';
    return this.enrollmentsService.findOne(id, userId, userRole);
  }

  @Patch(':id/cancel')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Cancel enrollment (admin only)',
    description: 'Cancels an enrollment and tracks who cancelled it',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment cancelled successfully',
    schema: {
      example: {
        id: 'uuid-here',
        status: 'CANCELLED',
        cancelledAt: '2026-01-12T10:00:00.000Z',
        cancelledBy: 'admin-uuid',
        message: 'Enrollment cancelled successfully'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - already cancelled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  cancel(@Param('id') id: string, @Req() req: Request) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.cancel(id, userId);
  }

  @Patch(':id/resume')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Resume suspended enrollment (admin only)',
    description: 'Resumes a suspended enrollment and resets grace period',
  })
  @ApiResponse({
    status: 200,
    description: 'Enrollment resumed successfully',
    schema: {
      example: {
        id: 'uuid-here',
        status: 'ONGOING',
        resumedAt: '2026-01-12T10:00:00.000Z',
        gracePeriodDaysUsed: 0,
        message: 'Enrollment resumed successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - only suspended enrollments can be resumed',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  resume(@Param('id') id: string) {
    return this.enrollmentsService.resume(id);
  }

  @Patch(':id/link-client')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Link client to enrollment (admin only)',
    description: 'Links a client to an enrollment and disables payment links',
  })
  @ApiResponse({
    status: 200,
    description: 'Client linked successfully',
    schema: {
      example: {
        id: 'uuid-here',
        clientId: 'client-uuid',
        message: 'Client linked successfully'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - enrollment already has client or duplicate enrollment',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment or client not found' })
  linkClient(@Param('id') id: string, @Body() linkClientDto: LinkClientDto) {
    return this.enrollmentsService.linkClient(id, linkClientDto);
  }

  @Post(':id/generate-payment-link')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'agent')
  @ApiOperation({
    summary: 'Generate payment link (admin/agent)',
    description:
      'Generates a shareable payment link for an invoice. Requires first/last name if no client linked.',
  })
  @ApiResponse({
    status: 201,
    description: 'Payment link generated successfully',
    schema: {
      example: {
        token: 'random-secure-token-here',
        paymentUrl: 'https://yourapp.com/pay/random-secure-token-here',
        expiresAt: '2026-01-19T10:00:00.000Z',
        enrollmentId: 'uuid-here',
        invoiceId: 'invoice-uuid'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - names required or no unpaid invoices or sequential payment violation',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Enrollment or invoice not found' })
  generatePaymentLink(
    @Param('id') id: string,
    @Body() generateDto: GeneratePaymentLinkDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).id;
    return this.enrollmentsService.generatePaymentLink(id, generateDto, userId);
  }
}
