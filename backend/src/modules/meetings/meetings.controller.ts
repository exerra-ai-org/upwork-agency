import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto, UpdateMeetingDto, CompleteMeetingDto } from './dto';
import { MeetingStatus } from '@prisma/client';

@ApiTags('Meetings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'closerId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: MeetingStatus })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('closerId') closerId?: string,
    @Query('status') status?: MeetingStatus,
  ) {
    return this.meetingsService.findAll(pagination, { closerId, status });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.meetingsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Body() dto: CompleteMeetingDto) {
    return this.meetingsService.complete(id, dto);
  }
}
