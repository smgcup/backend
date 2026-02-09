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
import { AdminModule } from './admin/admin.module';
import { MatchModule } from './match/match.module';
import { NewsModule } from './news/news.module';
import { MatchEventModule } from './match-event/match-event.module';
import { UserModule } from './user/user.module';
import { GeneratorModule } from './generator/generator.module';
import { ImageModule } from './image/image.module';
import { PredictionModule } from './prediction/prediction.module';
import { StatisticsModule } from './statistics/statistics.module';
import { PlayerAppearanceModule } from './player-appearance/player-appearance.module';
import { FantasyPlayerModule } from './fantasy-player/fantasy-player.module';

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
        SUPABASE_URL: Joi.string().required(),
        SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),
      }),
      validationOptions: { abortEarly: true },
      isGlobal: true,
    }),
    HealthModule,
    TeamModule,
    PlayerModule,
    AdminModule,
    MatchModule,
    MatchEventModule,
    NewsModule,
    UserModule,
    GeneratorModule,
    ImageModule,
    PredictionModule,
    StatisticsModule,
    PlayerAppearanceModule,
    FantasyPlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService, ApplicationExceptionFilter],
})
export class AppModule {}
