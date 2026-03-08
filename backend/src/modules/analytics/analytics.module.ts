import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsAggregationService } from './analytics-aggregation.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsAggregationService],
  exports: [AnalyticsService, AnalyticsAggregationService],
})
export class AnalyticsModule {}
