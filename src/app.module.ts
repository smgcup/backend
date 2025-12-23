import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphqlModule } from './graphql/graphql.module';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { ApplicationExceptionFilter } from './exception/application-exception.filter';
import * as Joi from 'joi';
import { HealthModule } from './health/health.module';
import { TeamModule } from './team/team.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    GraphqlModule,
    DbModule,
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
      }),
      validationOptions: { abortEarly: true },
      isGlobal: true,
    }),
    HealthModule,
    TeamModule,
    PlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ApplicationExceptionFilter],
})
export class AppModule {}
