import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { VideoService } from './video.service';
import { CreateVideoProposalDto } from './dto';

@ApiTags('Videos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  create(@Body() dto: CreateVideoProposalDto) {
    return this.videoService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query() pagination: PaginationDto, @Query('projectId') projectId?: string) {
    return this.videoService.findAll(pagination, projectId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.videoService.findById(id);
  }

  @Get('project/:projectId')
  findByProjectId(@Param('projectId') projectId: string) {
    return this.videoService.findByProjectId(projectId);
  }

  @Post(':id/view')
  incrementViewCount(@Param('id') id: string) {
    return this.videoService.incrementViewCount(id);
  }

  @Post('upload-url')
  getUploadUrl(@Body('fileName') fileName: string) {
    return this.videoService.getUploadUrl(fileName);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.videoService.delete(id);
  }
}
