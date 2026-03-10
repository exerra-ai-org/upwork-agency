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

  @Get('top-closers')
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getTopClosers(@Query() query: DateRangeDto, @Query('limit') limit?: string) {
    return this.analyticsService.getTopClosers(
      new Date(query.startDate),
      new Date(query.endDate),
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('orgs/:organizationId')
  getOrgSummary(@Param('organizationId') organizationId: string) {
    return this.analyticsService.getOrgSummary(organizationId);
  }
}
