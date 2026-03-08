import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { AnalyticsService } from './analytics.service';
import { DateRangeDto } from './dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboardSummary() {
    return this.analyticsService.getDashboardSummary();
  }

  @Get('funnel')
  getFunnelMetrics(@Query() query: DateRangeDto) {
    return this.analyticsService.getFunnelMetrics(
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('agents/:agentId')
  getAgentMetrics(@Param('agentId') agentId: string, @Query() query: DateRangeDto) {
    return this.analyticsService.getAgentMetrics(
      agentId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('accounts/:accountId')
  getAccountMetrics(@Param('accountId') accountId: string, @Query() query: DateRangeDto) {
    return this.analyticsService.getAccountMetrics(
      accountId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('top-agents')
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getTopAgents(@Query() query: DateRangeDto, @Query('limit') limit?: string) {
    return this.analyticsService.getTopAgents(
      new Date(query.startDate),
      new Date(query.endDate),
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
