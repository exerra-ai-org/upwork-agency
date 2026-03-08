import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QAStatus } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { QAService } from './qa.service';
import { CreateQAReviewDto, UpdateQAReviewDto } from './dto';

@ApiTags('QA Reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('qa-reviews')
export class QAController {
  constructor(private readonly qaService: QAService) {}

  @Post()
  create(@Body() dto: CreateQAReviewDto) {
    return this.qaService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'reviewerId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: QAStatus })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('reviewerId') reviewerId?: string,
    @Query('status') status?: QAStatus,
  ) {
    return this.qaService.findAll(pagination, { reviewerId, status });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.qaService.findById(id);
  }

  @Get('task/:taskId')
  findByTaskId(@Param('taskId') taskId: string) {
    return this.qaService.findByTaskId(taskId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQAReviewDto) {
    return this.qaService.update(id, dto);
  }
}
