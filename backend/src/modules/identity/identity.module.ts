import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { InvitationsService } from './invitations.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MailerModule } from '@/modules/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule,
    MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [AuthService, UsersService, InvitationsService, JwtStrategy],
  exports: [AuthService, UsersService, InvitationsService],
})
export class IdentityModule {}
