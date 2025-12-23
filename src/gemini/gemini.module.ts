import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiResolver } from './gemini.resolver';
import { GeminiSubscriptionManagerService } from './gemini-subscription-manager.service';
import { PubSub } from 'graphql-subscriptions';

@Module({
  imports: [],
  providers: [
    {
      provide: 'PUB_SUB',
      useValue: new PubSub(),
    },
    GeminiSubscriptionManagerService,
    GeminiService,
    GeminiResolver,
  ],
  exports: [GeminiService],
})
export class GeminiModule {}
