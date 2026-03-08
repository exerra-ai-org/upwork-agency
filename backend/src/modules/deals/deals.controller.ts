import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, CloseDealDto } from './dto';
import { DealStatus } from '@prisma/client';

@ApiTags('Deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  create(@Body() dto: CreateDealDto) {
    return this.dealsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'status', enum: DealStatus, required: false })
  findAll(@Query() pagination: PaginationDto, @Query('status') status?: DealStatus) {
    return this.dealsService.findAll(pagination, { status });
  }

  @Get('stats')
  getStats() {
    return this.dealsService.getStats();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.dealsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseDealDto) {
    return this.dealsService.close(id, dto.status);
  }
}
