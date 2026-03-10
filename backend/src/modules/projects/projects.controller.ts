import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { ProjectStage } from '@prisma/client';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'stage', enum: ProjectStage, required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('stage') stage?: ProjectStage,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.projectsService.findAll(pagination, { stage, organizationId });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.projectsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body('stage') stage: ProjectStage) {
    return this.projectsService.updateStage(id, stage);
  }
}
