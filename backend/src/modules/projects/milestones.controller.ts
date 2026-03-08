import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { MilestonesService } from './milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from './dto';

@ApiTags('Milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/milestones')
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  create(@Param('projectId') projectId: string, @Body() dto: CreateMilestoneDto) {
    return this.milestonesService.create(projectId, dto);
  }

  @Get()
  findByProjectId(@Param('projectId') projectId: string) {
    return this.milestonesService.findByProjectId(projectId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMilestoneDto) {
    return this.milestonesService.update(id, dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.milestonesService.complete(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.milestonesService.delete(id);
  }
}
