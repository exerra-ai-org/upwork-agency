import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { DailyAgentMetric, DailyAccountMetric, DealStatus, ProposalStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAgentMetrics(
    agentId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyAgentMetric[]> {
    return this.prisma.dailyAgentMetric.findMany({
      where: {
        agentId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getAccountMetrics(
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<DailyAccountMetric[]> {
    return this.prisma.dailyAccountMetric.findMany({
      where: {
        accountId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });
  }

  async getFunnelMetrics(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    proposalsSent: number;
    proposalsViewed: number;
    proposalsReplied: number;
    meetingsBooked: number;
    dealsClosed: number;
  }> {
    const result = await this.prisma.dailyAgentMetric.aggregate({
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        proposalsSent: true,
        proposalsViewed: true,
        proposalsReplied: true,
        meetingsBooked: true,
        dealsClosed: true,
      },
    });

    return {
      proposalsSent: result._sum.proposalsSent ?? 0,
      proposalsViewed: result._sum.proposalsViewed ?? 0,
      proposalsReplied: result._sum.proposalsReplied ?? 0,
      meetingsBooked: result._sum.meetingsBooked ?? 0,
      dealsClosed: result._sum.dealsClosed ?? 0,
    };
  }

  async getTopAgents(
    startDate: Date,
    endDate: Date,
    limit: number,
  ): Promise<
    {
      agentId: string;
      totalDealValue: number;
      dealsClosed: number;
      proposalsSent: number;
    }[]
  > {
    const metrics = await this.prisma.dailyAgentMetric.groupBy({
      by: ['agentId'],
      where: {
        date: { gte: startDate, lte: endDate },
      },
      _sum: {
        totalDealValue: true,
        dealsClosed: true,
        proposalsSent: true,
      },
      orderBy: {
        _sum: { totalDealValue: 'desc' },
      },
      take: limit,
    });

    return metrics.map((m) => ({
      agentId: m.agentId,
      totalDealValue: m._sum.totalDealValue ?? 0,
      dealsClosed: m._sum.dealsClosed ?? 0,
      proposalsSent: m._sum.proposalsSent ?? 0,
    }));
  }

  async getDashboardSummary(): Promise<{
    totalProposals: number;
    totalMeetings: number;
    totalDeals: number;
    totalRevenue: number;
    conversionRates: {
      viewRate: number;
      replyRate: number;
      meetingRate: number;
      dealRate: number;
    };
  }> {
    const [totalProposals, totalMeetings, totalDeals, revenueAgg, statusCounts] = await Promise.all(
      [
        this.prisma.proposal.count(),
        this.prisma.meeting.count(),
        this.prisma.deal.count({ where: { status: DealStatus.WON } }),
        this.prisma.deal.aggregate({
          where: { status: DealStatus.WON },
          _sum: { value: true },
        }),
        this.prisma.proposal.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      ],
    );

    const countByStatus: Record<string, number> = {};
    for (const entry of statusCounts) {
      countByStatus[entry.status] = entry._count.status;
    }

    const sent = totalProposals;
    const viewed = countByStatus[ProposalStatus.VIEWED] ?? 0;
    const replied = countByStatus[ProposalStatus.REPLIED] ?? 0;
    const interviewed = countByStatus[ProposalStatus.INTERVIEW] ?? 0;

    return {
      totalProposals,
      totalMeetings,
      totalDeals,
      totalRevenue: revenueAgg._sum.value ?? 0,
      conversionRates: {
        viewRate: sent > 0 ? viewed / sent : 0,
        replyRate: sent > 0 ? replied / sent : 0,
        meetingRate: sent > 0 ? interviewed / sent : 0,
        dealRate: sent > 0 ? totalDeals / sent : 0,
      },
    };
  }
}
