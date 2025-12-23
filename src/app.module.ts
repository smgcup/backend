import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './graphql/graphql.module';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ApplicationExceptionFilter } from './exception/application-exception.filter';
import { UserModule } from './user/user.module';
import { TeamModule } from './team/team.module';
import { AthleteModule } from './athlete/athlete.module';
import * as Joi from 'joi';
import { HealthModule } from './health/health.module';
import { HealthFactorModule } from './health-factor/health-factor.module';
import { TerraModule } from './terra/terra.module';
import { WebhookModule } from './webhook/webhook.module';
import { AdminModule } from './admin/admin.module';
import { TeamRegistrationLinkModule } from './team-registration-link/team-registration-link.module';
import { AccountModule } from './account/account.module';
import { ScheduleEventsModule } from './schedule-events/schedule-events.module';
import { GeminiModule } from './gemini/gemini.module';
import { InboxModule } from './inbox/inbox.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    GraphqlModule,
    DbModule,
    AccountModule,
    UserModule,
    TeamModule,
    AthleteModule,
    HealthModule,
    HealthFactorModule,
    TerraModule,
    WebhookModule,
    AdminModule,
    TeamRegistrationLinkModule,
    ScheduleEventsModule,
    GeminiModule,
    InboxModule,
    NotificationModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        DB_SYNCH: Joi.string().default('false'),
        DB_LOG: Joi.string().default('false'),
        NAMESPACE: Joi.string().required(),
        JWT_SECRET: Joi.string().required(), // Add this
        JWT_EXPIRES_IN: Joi.string().default('7d'), // Add this (optional)
        TERRA_CONTINUES_SYNC_PERIOD_DAYS: Joi.string().required(), // Period in days for continues sync
        TERRA_SYNC_INTERVAL_MINUTES: Joi.string().required(), // Interval in minutes for scheduled team athlete sync
      }),
      validationOptions: { abortEarly: true },
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ApplicationExceptionFilter],
})
export class AppModule {}
