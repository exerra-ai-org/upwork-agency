import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AgentsService } from './agents.service';
import { AccountsController } from './accounts.controller';
import { AgentsController } from './agents.controller';

@Module({
  controllers: [AccountsController, AgentsController],
  providers: [AccountsService, AgentsService],
  exports: [AccountsService, AgentsService],
})
export class AccountsModule {}
