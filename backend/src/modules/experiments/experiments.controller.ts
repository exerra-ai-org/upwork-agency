import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { ExperimentsService } from './experiments.service';
import { CreateExperimentDto, UpdateExperimentDto, CreateAssignmentDto } from './dto';
import { ExperimentStatus } from '@prisma/client';

@ApiTags('Experiments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('experiments')
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Post()
  create(@Body() dto: CreateExperimentDto) {
    return this.experimentsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: ExperimentStatus })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: ExperimentStatus) {
    return this.experimentsService.findAll(pagination, { status });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.experimentsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExperimentDto) {
    return this.experimentsService.update(id, dto);
  }

  @Post(':id/start')
  start(@Param('id') id: string) {
    return this.experimentsService.start(id);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.experimentsService.pause(id);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.experimentsService.complete(id);
  }

  @Post(':id/assign')
  assignVariant(@Param('id') id: string, @Body() dto: CreateAssignmentDto) {
    return this.experimentsService.assignVariant(id, dto);
  }

  @Get(':id/results')
  getResults(@Param('id') id: string) {
    return this.experimentsService.getResults(id);
  }
}
