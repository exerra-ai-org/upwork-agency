import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { DealStatus, MeetingStatus, ProposalStatus } from '@prisma/client';

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 * * * *')
  async aggregateDailyAgentMetrics(): Promise<void> {
    this.logger.log('Starting daily agent metrics aggregation');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const agents = await this.prisma.agent.findMany({
        where: { isActive: true },
        select: { id: true },
      });

      for (const agent of agents) {
        const [
          proposalsSent,
          proposalsViewed,
          proposalsReplied,
          meetingsBooked,
          dealsWon,
          dealValueAgg,
          videosRecorded,
        ] = await Promise.all([
          this.prisma.proposal.count({
            where: {
              agentId: agent.id,
              status: ProposalStatus.SENT,
              sentAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.proposal.count({
            where: {
              agentId: agent.id,
              status: ProposalStatus.VIEWED,
              updatedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.proposal.count({
            where: {
              agentId: agent.id,
              status: ProposalStatus.REPLIED,
              replyAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.meeting.count({
            where: {
              proposal: { agentId: agent.id },
              status: MeetingStatus.SCHEDULED,
              createdAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.deal.count({
            where: {
              proposal: { agentId: agent.id },
              status: DealStatus.WON,
              closedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.deal.aggregate({
            where: {
              proposal: { agentId: agent.id },
              status: DealStatus.WON,
              closedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
            _sum: { value: true },
          }),
          this.prisma.videoProposal.count({
            where: {
              proposal: { agentId: agent.id },
              createdAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
        ]);

        await this.prisma.dailyAgentMetric.upsert({
          where: {
            agentId_date: { agentId: agent.id, date: today },
          },
          create: {
            agentId: agent.id,
            date: today,
            proposalsSent,
            proposalsViewed,
            proposalsReplied,
            meetingsBooked,
            dealsClosed: dealsWon,
            totalDealValue: dealValueAgg._sum.value ?? 0,
            videosRecorded,
          },
          update: {
            proposalsSent,
            proposalsViewed,
            proposalsReplied,
            meetingsBooked,
            dealsClosed: dealsWon,
            totalDealValue: dealValueAgg._sum.value ?? 0,
            videosRecorded,
          },
        });
      }

      this.logger.log(`Completed daily agent metrics aggregation for ${agents.length} agents`);
    } catch (error) {
      this.logger.error('Failed to aggregate daily agent metrics', error);
    }
  }

  @Cron('0 * * * *')
  async aggregateDailyAccountMetrics(): Promise<void> {
    this.logger.log('Starting daily account metrics aggregation');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const accounts = await this.prisma.freelanceAccount.findMany({
        select: { id: true },
      });

      for (const account of accounts) {
        const [
          proposalsSent,
          proposalsViewed,
          proposalsReplied,
          meetingsBooked,
          dealsWon,
          dealValueAgg,
        ] = await Promise.all([
          this.prisma.proposal.count({
            where: {
              agent: { freelanceAccountId: account.id },
              status: ProposalStatus.SENT,
              sentAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.proposal.count({
            where: {
              agent: { freelanceAccountId: account.id },
              status: ProposalStatus.VIEWED,
              updatedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.proposal.count({
            where: {
              agent: { freelanceAccountId: account.id },
              status: ProposalStatus.REPLIED,
              replyAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.meeting.count({
            where: {
              proposal: { agent: { freelanceAccountId: account.id } },
              status: MeetingStatus.SCHEDULED,
              createdAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.deal.count({
            where: {
              proposal: { agent: { freelanceAccountId: account.id } },
              status: DealStatus.WON,
              closedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
          }),
          this.prisma.deal.aggregate({
            where: {
              proposal: { agent: { freelanceAccountId: account.id } },
              status: DealStatus.WON,
              closedAt: { gte: today, lt: new Date(today.getTime() + 86_400_000) },
            },
            _sum: { value: true },
          }),
        ]);

        const conversionRate = proposalsSent > 0 ? dealsWon / proposalsSent : 0;

        await this.prisma.dailyAccountMetric.upsert({
          where: {
            accountId_date: { accountId: account.id, date: today },
          },
          create: {
            accountId: account.id,
            date: today,
            proposalsSent,
            proposalsViewed,
            proposalsReplied,
            meetingsBooked,
            dealsClosed: dealsWon,
            totalDealValue: dealValueAgg._sum.value ?? 0,
            conversionRate,
          },
          update: {
            proposalsSent,
            proposalsViewed,
            proposalsReplied,
            meetingsBooked,
            dealsClosed: dealsWon,
            totalDealValue: dealValueAgg._sum.value ?? 0,
            conversionRate,
          },
        });
      }

      this.logger.log(
        `Completed daily account metrics aggregation for ${accounts.length} accounts`,
      );
    } catch (error) {
      this.logger.error('Failed to aggregate daily account metrics', error);
    }
  }
}
