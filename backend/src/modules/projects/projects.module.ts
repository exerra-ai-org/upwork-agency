import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MilestonesService } from './milestones.service';
import { LinksService } from './links.service';
import { ProjectsController } from './projects.controller';
import { MilestonesController } from './milestones.controller';
import { LinksController } from './links.controller';

@Module({
  controllers: [ProjectsController, MilestonesController, LinksController],
  providers: [ProjectsService, MilestonesService, LinksService],
  exports: [ProjectsService, MilestonesService, LinksService],
})
export class ProjectsModule {}
