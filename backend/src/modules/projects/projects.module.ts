import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { MilestonesService } from './milestones.service';
import { ProjectsController } from './projects.controller';
import { MilestonesController } from './milestones.controller';

@Module({
  controllers: [ProjectsController, MilestonesController],
  providers: [ProjectsService, MilestonesService],
  exports: [ProjectsService, MilestonesService],
})
export class ProjectsModule {}
