import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookController } from './webhook.controller';
import { TerraWebhookService } from './terra/terra-webook.service';
import { TerraChunkAggregatorService } from './terra/services/terra-chunk-aggregator.service';
import { TerraWebhookChunksCompleteListener } from './terra/listeners/terra-webhook-chunks-complete.listener';
import { TerraWebhookTransformListener } from './terra/listeners/terra-webhook-transform.listener';
import { TerraWebhookTransformCompleteListener } from './terra/listeners/terra-webhook-transform-complete.listener';
import { TerraWebhookSaveListener } from './terra/listeners/terra-webhook-save.listener';
import { Athlete } from '../athlete/entities/athlete.entity';
import { TerraDailyRecord } from '../terra/entities/terra-daily-record.entity';
import { TerraModule } from '../terra/terra.module';
import { AthleteModule } from '../athlete/athlete.module';

@Module({
  imports: [TypeOrmModule.forFeature([Athlete, TerraDailyRecord]), TerraModule, AthleteModule],
  controllers: [WebhookController],
  providers: [
    TerraWebhookService,
    TerraChunkAggregatorService,
    TerraWebhookChunksCompleteListener,
    TerraWebhookTransformListener,
    TerraWebhookTransformCompleteListener,
    TerraWebhookSaveListener,
  ],
})
export class WebhookModule {}
