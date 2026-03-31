import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser } from '@/common/decorators';
import { JwtPayload } from '@/common/interfaces';
import { LinksService } from './links.service';
import { CreateProjectLinkDto, UpdateProjectLinkDto } from './dto';

@ApiTags('Project Links')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Post()
  @ApiOperation({ summary: 'Add a link/resource to a project' })
  create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateProjectLinkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.linksService.create(projectId, dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'List all links for a project' })
  findByProjectId(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.linksService.findByProjectId(projectId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project link' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProjectLinkDto) {
    return this.linksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project link' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.linksService.delete(id);
  }
}
