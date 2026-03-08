import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto, UpdateProposalDto, FindProposalsDto, UpdateStatusDto } from './dto';

@ApiTags('Proposals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Get('stats')
  getStats(@Query('agentId') agentId?: string) {
    return this.proposalsService.getStats(agentId);
  }

  @Get()
  findAll(@Query() query: FindProposalsDto) {
    return this.proposalsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.proposalsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.proposalsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.proposalsService.updateStatus(id, dto.status);
  }
}
