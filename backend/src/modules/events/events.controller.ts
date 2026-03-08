import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { EventsService } from './events.service';
import { CreateEventDto, FindEventsDto } from './dto';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto) {
    return this.eventsService.create(dto);
  }

  @Post('batch')
  createBatch(@Body() dtos: CreateEventDto[]) {
    return this.eventsService.createBatch(dtos);
  }

  @Get()
  findAll(@Query() query: FindEventsDto) {
    return this.eventsService.findAll(query);
  }

  @Get('count/:entityType/:entityId')
  countByType(@Param('entityType') entityType: string, @Param('entityId') entityId: string) {
    return this.eventsService.countByType(entityType, entityId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.eventsService.findById(id);
  }
}
