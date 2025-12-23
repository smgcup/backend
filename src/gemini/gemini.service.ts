import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: GoogleGenAI;
  private readonly fileSearchStoreName: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const storeName = this.configService.get<string>('GEMINI_FILE_SEARCH_STORE_NAME');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    if (!storeName) {
      throw new Error('GEMINI_FILE_SEARCH_STORE_NAME is not set');
    }

    this.client = new GoogleGenAI({ apiKey });
    this.fileSearchStoreName = storeName;
  }

  /**
   * Sends a prompt to Gemini using File Search as knowledge base
   */
  async geminiFileSearchPrompt(prompt: string): Promise<string> {
    this.logger.log(`Querying Gemini with File Search: ${prompt}`);

    const response = await this.client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [this.fileSearchStoreName],
            },
          },
        ],
      },
    });

    return response.text ?? '';
  }

  /**
   * Streams a prompt to Gemini using File Search as knowledge base
   * Publishes chunks to PubSub for GraphQL subscriptions
   */
  async geminiFileSearchPromptStream(prompt: string, subscriptionId: string): Promise<void> {
    this.logger.log(`Streaming query to Gemini with File Search: ${prompt} (subscription: ${subscriptionId})`);

    try {
      const response = await this.client.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [this.fileSearchStoreName],
              },
            },
          ],
        },
      });

      let hasPublishedChunk = false;
      for await (const chunk of response) {
        try {
          // Extract all text parts from the chunk
          // The chunk might have multiple parts (text, executableCode, etc.)
          let textContent = '';

          // Try to get text from the chunk
          // The Gemini SDK should provide chunk.text with concatenated text parts

          try {
            const textValue = chunk.text;
            // Log what the getter returns (only first time for debugging)
            if (typeof textValue === 'string' && textValue.length > 0) {
              textContent = textValue;
              this.logger.debug(
                `Extracted text content: "${textContent.substring(0, 50)}..." (length: ${textContent.length})`,
              );
            }
          } catch (_error) {
            this.logger.error('Error accessing text', _error);
          }

          // Only publish if we have text content (skip chunks with only non-text parts like executableCode)
          if (textContent && textContent.trim().length > 0) {
            hasPublishedChunk = true;
            this.logger.debug(
              `Publishing text chunk: "${textContent.substring(0, 50)}..." (length: ${textContent.length})`,
            );
            // Publish to PubSub
            await this.pubSub.publish('GEMINI_STREAM', {
              geminiFileSearchPromptStream: {
                subscriptionId,
                chunk: { text: textContent, done: false },
              },
            });
          } else if (!hasPublishedChunk) {
            this.logger.debug(`Skipping chunk - no text content (textContent length: ${textContent.length})`);
          }
        } catch (chunkError) {
          this.logger.warn(
            `Error processing chunk: ${chunkError instanceof Error ? chunkError.message : String(chunkError)}`,
          );
          // Continue processing other chunks
        }
      }

      // If we never published anything, log a warning and publish a message
      if (!hasPublishedChunk) {
        this.logger.warn('Stream completed without publishing any text content');
        // Publish a message to prevent GraphQL null error
        await this.pubSub.publish('GEMINI_STREAM', {
          geminiFileSearchPromptStream: {
            subscriptionId,
            chunk: { text: 'No text content available in the response.', done: true },
          },
        });
      } else {
        // Publish completion marker
        await this.pubSub.publish('GEMINI_STREAM', {
          geminiFileSearchPromptStream: {
            subscriptionId,
            chunk: { text: '', done: true },
          },
        });
      }
    } catch (error) {
      this.logger.error(`Error in streaming: ${error instanceof Error ? error.message : String(error)}`);
      // Publish error message with done flag
      await this.pubSub.publish('GEMINI_STREAM', {
        geminiFileSearchPromptStream: {
          subscriptionId,
          chunk: {
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            done: true,
          },
        },
      });
      throw error;
    }
  }
}
