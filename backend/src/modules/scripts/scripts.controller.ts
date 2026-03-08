import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { PaginationDto } from '@/common/dto';
import { ScriptsService } from './scripts.service';
import { CreateScriptDto, CreateVersionDto } from './dto';

@ApiTags('Scripts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new script with initial version' })
  create(@Body() dto: CreateScriptDto, @CurrentUser('sub') userId: string) {
    return this.scriptsService.create(dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all scripts (paginated) with latest version' })
  findAll(@Query() pagination: PaginationDto) {
    return this.scriptsService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a script with all versions' })
  findById(@Param('id') id: string) {
    return this.scriptsService.findById(id);
  }

  @Post(':id/version')
  @ApiOperation({ summary: 'Create a new version for a script' })
  createVersion(@Param('id') scriptId: string, @Body() dto: CreateVersionDto) {
    return this.scriptsService.createVersion(scriptId, dto);
  }

  @Get(':id/version/:version')
  @ApiOperation({ summary: 'Get a specific version of a script' })
  getVersion(@Param('id') scriptId: string, @Param('version', ParseIntPipe) version: number) {
    return this.scriptsService.getVersion(scriptId, version);
  }
}
