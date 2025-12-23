import { Resolver, Args, Query, Subscription } from '@nestjs/graphql';
import { Logger, Inject } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiStreamChunk } from './entities/gemini-stream-chunk.entity';
import { PubSub } from 'graphql-subscriptions';
import { GeminiStreamPayload } from './types/GeminiStreamPayload.type';
import { GeminiSubscriptionManagerService } from './gemini-subscription-manager.service';

@Resolver()
export class GeminiResolver {
  private readonly logger = new Logger(GeminiResolver.name);

  constructor(
    private readonly geminiService: GeminiService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
    private readonly subscriptionManager: GeminiSubscriptionManagerService,
  ) {}

  @Query(() => String, { name: 'geminiFileSearchPrompt', nullable: false })
  async geminiFileSearchPrompt(@Args('prompt') prompt: string): Promise<string> {
    return await this.geminiService.geminiFileSearchPrompt(prompt);
  }

  @Subscription(() => GeminiStreamChunk, {
    name: 'geminiFileSearchPromptStream',
    nullable: false,
    filter: (payload: GeminiStreamPayload) => {
      // Filter based on active subscriptions - only return if subscription is still active
      // Always allow through completion markers (done: true) even if subscription was removed
      const chunk = payload.geminiFileSearchPromptStream.chunk;
      if (chunk.done === true) {
        return true;
      }
      const subscriptionId = payload.geminiFileSearchPromptStream.subscriptionId;
      const manager = GeminiSubscriptionManagerService.getInstance();
      return manager?.has(subscriptionId) ?? false;
    },
    resolve: (payload: GeminiStreamPayload) => {
      // Extract the chunk from the payload and convert to GeminiStreamChunk
      const chunk = new GeminiStreamChunk();
      chunk.text = payload.geminiFileSearchPromptStream.chunk.text;
      chunk.done = payload.geminiFileSearchPromptStream.chunk.done ?? false;
      return chunk;
    },
  })
  geminiFileSearchPromptStream(@Args('prompt') prompt: string) {
    // Generate a unique subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    this.logger.log(`Subscription started for prompt: ${prompt} (subscription: ${subscriptionId})`);

    // Register this subscription as active
    this.subscriptionManager.add(subscriptionId);

    // Start streaming in the background (don't await)
    this.geminiService
      .geminiFileSearchPromptStream(prompt, subscriptionId)
      .then(() => {
        // Remove subscription after a short delay to ensure completion marker is delivered
        // The filter will still allow through done: true messages even after removal
        setTimeout(() => {
          this.subscriptionManager.remove(subscriptionId);
          this.logger.log(`Subscription completed: ${subscriptionId}`);
        }, 100);
      })
      .catch((error) => {
        this.subscriptionManager.remove(subscriptionId);
        this.logger.error(`Error in background streaming: ${error instanceof Error ? error.message : String(error)}`);
      });

    return this.pubSub.asyncIterableIterator('GEMINI_STREAM');
  }
}
