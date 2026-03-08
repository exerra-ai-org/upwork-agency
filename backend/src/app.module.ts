import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { IdentityModule } from './modules/identity/identity.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { VideoModule } from './modules/video/video.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { DealsModule } from './modules/deals/deals.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { QAModule } from './modules/qa/qa.module';
import { EventsModule } from './modules/events/events.module';
import { ExperimentsModule } from './modules/experiments/experiments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { JwtAuthGuard } from './common/guards';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    IdentityModule,
    AccountsModule,
    ClientsModule,
    ProposalsModule,
    ScriptsModule,
    VideoModule,
    MeetingsModule,
    DealsModule,
    ProjectsModule,
    TasksModule,
    QAModule,
    EventsModule,
    ExperimentsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
