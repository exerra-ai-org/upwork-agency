import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NichesService } from './niches.service';
import { CreateNicheDto, UpdateNicheDto } from './dto';
import { Roles } from '@/common/decorators';

@ApiTags('Niches')
@ApiBearerAuth()
@Controller('niches')
export class NichesController {
  constructor(private readonly nichesService: NichesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new niche' })
  async create(@Body() dto: CreateNicheDto) {
    return this.nichesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all niches' })
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('includeInactive') includeInactive?: boolean,
  ) {
    return this.nichesService.findAll(organizationId, includeInactive);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get niche by ID' })
  async findOne(@Param('id') id: string) {
    return this.nichesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a niche' })
  async update(@Param('id') id: string, @Body() dto: UpdateNicheDto) {
    return this.nichesService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete a niche (set inactive)' })
  async remove(@Param('id') id: string) {
    return this.nichesService.remove(id);
  }
}
