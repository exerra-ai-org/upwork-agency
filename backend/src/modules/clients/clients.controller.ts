import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AccountPlatform } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards';
import { PaginationDto } from '@/common/dto';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Body() dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'platform', required: false, enum: AccountPlatform })
  findAll(
    @Query() pagination: PaginationDto,
    @Query('search') search?: string,
    @Query('platform') platform?: AccountPlatform,
  ) {
    return this.clientsService.findAll(pagination, search, platform);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }
}
