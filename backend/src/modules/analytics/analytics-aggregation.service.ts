import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@/prisma/prisma.service';
import { ProjectStage } from '@prisma/client';

@Injectable()
export class AnalyticsAggregationService {
  private readonly logger = new Logger(AnalyticsAggregationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every hour to log a snapshot of current pipeline stage counts.
   * Since we no longer have denormalised daily metric tables, this just
   * logs a summary — the real analytics are computed on-the-fly from the
   * projects table in AnalyticsService.
   */
  @Cron('0 * * * *')
  async aggregatePipelineSnapshot(): Promise<void> {
    this.logger.log('Starting hourly pipeline snapshot');

    try {
      const stageCounts = await this.prisma.project.groupBy({
        by: ['stage'],
        _count: { id: true },
      });

      const summary = stageCounts
        .map((s: { stage: string; _count: { id: number } }) => `${s.stage}=${s._count.id}`)
        .join(', ');

      this.logger.log(`Pipeline snapshot: ${summary}`);
    } catch (error) {
      this.logger.error('Failed to aggregate pipeline snapshot', error);
    }
  }

  /**
   * Runs every hour to log win-rate and bid-rate metrics per closer.
   */
  @Cron('0 * * * *')
  async aggregateCloserMetrics(): Promise<void> {
    this.logger.log('Starting hourly closer metrics aggregation');

    try {
      const closers = await this.prisma.user.findMany({
        where: { role: { name: 'closer' } },
        select: { id: true, email: true },
      });

      for (const closer of closers) {
        const [totalAssigned, totalWon, totalBidSubmitted] = await Promise.all([
          this.prisma.project.count({
            where: { assignedCloserId: closer.id },
          }),
          this.prisma.project.count({
            where: {
              assignedCloserId: closer.id,
              stage: ProjectStage.WON,
            },
          }),
          this.prisma.project.count({
            where: {
              assignedCloserId: closer.id,
              stage: {
                in: [
                  ProjectStage.BID_SUBMITTED,
                  ProjectStage.VIEWED,
                  ProjectStage.MESSAGED,
                  ProjectStage.INTERVIEW,
                  ProjectStage.WON,
                  ProjectStage.IN_PROGRESS,
                  ProjectStage.COMPLETED,
                ],
              },
            },
          }),
        ]);

        const winRate = totalBidSubmitted > 0 ? totalWon / totalBidSubmitted : 0;

        this.logger.debug(
          `Closer ${closer.email}: assigned=${totalAssigned}, bids=${totalBidSubmitted}, won=${totalWon}, winRate=${(winRate * 100).toFixed(1)}%`,
        );
      }

      this.logger.log(`Completed closer metrics aggregation for ${closers.length} closers`);
    } catch (error) {
      this.logger.error('Failed to aggregate closer metrics', error);
    }
  }
}
