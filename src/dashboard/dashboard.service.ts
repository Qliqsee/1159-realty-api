import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats(): Promise<AdminStatsResponseDto> {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfPreviousMonth = new Date(startOfCurrentMonth.getTime() - 1);
    const startOfPreviousMonth = new Date(
      endOfPreviousMonth.getFullYear(),
      endOfPreviousMonth.getMonth(),
      1,
    );

    // Total Enrollments
    const totalEnrollments = await this.prisma.enrollment.count();
    const enrollmentsLastMonth = await this.prisma.enrollment.count({
      where: { createdAt: { lte: endOfPreviousMonth } },
    });
    const enrollmentsChange = totalEnrollments - enrollmentsLastMonth;

    // Total Revenue (sum of amountPaid from all enrollments)
    const totalRevenueResult = await this.prisma.enrollment.aggregate({
      _sum: { amountPaid: true },
    });
    const totalRevenue = Number(totalRevenueResult._sum.amountPaid || 0);

    const revenueLastMonthResult = await this.prisma.enrollment.aggregate({
      where: { createdAt: { lte: endOfPreviousMonth } },
      _sum: { amountPaid: true },
    });
    const revenueLastMonth = Number(revenueLastMonthResult._sum.amountPaid || 0);
    const revenueChange = totalRevenue - revenueLastMonth;

    // Total Leads
    const totalLeads = await this.prisma.lead.count();
    const leadsLastMonth = await this.prisma.lead.count({
      where: { createdAt: { lte: endOfPreviousMonth } },
    });
    const leadsChange = totalLeads - leadsLastMonth;

    // Sales Target and Achieved
    // Get current month's sales targets
    const currentTargets = await this.prisma.salesTarget.findMany({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const salesTarget = currentTargets.reduce(
      (sum, target) => sum + Number(target.targetAmount),
      0,
    );
    const salesAchieved = currentTargets.reduce(
      (sum, target) => sum + Number(target.achievedAmount),
      0,
    );

    // Get previous month's sales targets (active during last day of previous month)
    const previousTargets = await this.prisma.salesTarget.findMany({
      where: {
        startDate: { lte: endOfPreviousMonth },
        endDate: { gte: endOfPreviousMonth },
      },
    });

    const salesTargetLastMonth = previousTargets.reduce(
      (sum, target) => sum + Number(target.targetAmount),
      0,
    );
    const salesAchievedLastMonth = previousTargets.reduce(
      (sum, target) => sum + Number(target.achievedAmount),
      0,
    );

    const salesTargetChange = salesTarget - salesTargetLastMonth;
    const salesAchievedChange = salesAchieved - salesAchievedLastMonth;

    // Total Partners (approved partnerships)
    const totalPartners = await this.prisma.partnership.count({
      where: { status: 'APPROVED' },
    });
    const partnersLastMonth = await this.prisma.partnership.count({
      where: {
        status: 'APPROVED',
        reviewedAt: { lte: endOfPreviousMonth },
      },
    });
    const partnersChange = totalPartners - partnersLastMonth;

    // Total Commissions (sum of commission amounts)
    const totalCommissionsResult = await this.prisma.commission.aggregate({
      _sum: { amount: true },
    });
    const totalCommissions = Number(totalCommissionsResult._sum.amount || 0);

    const commissionsLastMonthResult = await this.prisma.commission.aggregate({
      where: { createdAt: { lte: endOfPreviousMonth } },
      _sum: { amount: true },
    });
    const commissionsLastMonth = Number(commissionsLastMonthResult._sum.amount || 0);
    const commissionsChange = totalCommissions - commissionsLastMonth;

    return {
      totalEnrollments: {
        value: totalEnrollments,
        change: enrollmentsChange,
      },
      totalRevenue: {
        value: totalRevenue,
        change: revenueChange,
      },
      totalLeads: {
        value: totalLeads,
        change: leadsChange,
      },
      salesTarget: {
        value: salesTarget,
        change: salesTargetChange,
      },
      salesAchieved: {
        value: salesAchieved,
        change: salesAchievedChange,
      },
      totalPartners: {
        value: totalPartners,
        change: partnersChange,
      },
      totalCommissions: {
        value: totalCommissions,
        change: commissionsChange,
      },
    };
  }
}
