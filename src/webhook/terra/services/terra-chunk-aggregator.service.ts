import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TerraDailyDataWebhookPayload,
  TerraSleepDataWebhookPayload,
  TerraActivityDataWebhookPayload,
  TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM,
  TERRA_WEBHOOK_PAYLOAD_TYPE,
} from '../webhook-types';
import type {
  TerraAthleteDailyDataResponse,
  TerraAthleteSleepDataResponse,
  TerraAthleteActivityDataResponse,
} from '../../../terra/responses/terra-responses';
import {
  TERRA_WEBHOOK_EVENTS,
  TerraWebhookChunkReceivedEvent,
  TerraWebhookChunksCompleteEvent,
} from '../events/terra-webhook.events';
import type { TerraUser } from '../../../terra/types';
import { TerraHistoricalDataSession } from '../../../terra/entities/terra-historical-data-session.entity';
import { TerraHistoricalDataSessionService } from '../../../terra/terra-historical-data-session.service';

type ChunkAggregationState = {
  // Store arrays of chunks - multiple chunks can be of the same type
  dailyChunks: TerraAthleteDailyDataResponse[];
  sleepChunks: TerraAthleteSleepDataResponse[];
  activityChunks: TerraAthleteActivityDataResponse[];
  expectedPayloadsDaily: number | null;
  expectedPayloadsSleep: number | null;
  expectedPayloadsActivity: number | null;
  receivedPayloadsDaily: number;
  receivedPayloadsSleep: number;
  receivedPayloadsActivity: number;
  user: TerraUser;
  createdAt: Date;
};

@Injectable()
export class TerraChunkAggregatorService implements OnModuleDestroy {
  private readonly logger = new Logger(TerraChunkAggregatorService.name);

  // In-memory storage: Map<reference, ChunkAggregationState>
  private readonly chunks = new Map<string, ChunkAggregationState>();

  // Cleanup interval (5 minutes)
  private readonly CHUNK_TIMEOUT_MS = 5 * 60 * 1000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly terraHistoricalDataSessionService: TerraHistoricalDataSessionService,
  ) {
    // Start cleanup interval to remove stale chunks
    this.startCleanupInterval();
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Initialize aggregation state when large_request_sending is received
   */
  initializeAggregation(
    terraHistoricalDataActiveSessionId: TerraHistoricalDataSession['id'],
    chunkType: TERRA_WEBHOOK_PAYLOAD_TYPE,
    expectedPayloads: number,
    user: TerraUser,
  ): void {
    this.logger.debug(
      `Initializing aggregation for reference: ${terraHistoricalDataActiveSessionId}, expected: ${expectedPayloads} payloads for user: ${user.reference_id}`,
    );

    // Check if already exists (happens when the this is not the first payload we are receiving for the same terra data historical session)
    if (this.chunks.has(terraHistoricalDataActiveSessionId)) {
      const state = this.chunks.get(terraHistoricalDataActiveSessionId);
      if (!state) {
        this.logger.error(`State not found for reference ${terraHistoricalDataActiveSessionId}`);
        return;
      }
      if (chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY) {
        state.expectedPayloadsDaily = expectedPayloads;
      } else if (chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP) {
        state.expectedPayloadsSleep = expectedPayloads;
      } else if (chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY) {
        state.expectedPayloadsActivity = expectedPayloads;
      } else {
        this.logger.error(`Unknown chunk type for reference ${terraHistoricalDataActiveSessionId}`);
        return;
      }
      return;
    }

    // Initialize expected payloads based on chunkType
    const initialState: ChunkAggregationState = {
      dailyChunks: [],
      sleepChunks: [],
      activityChunks: [],
      expectedPayloadsDaily: chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY ? expectedPayloads : null,
      expectedPayloadsSleep: chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP ? expectedPayloads : null,
      expectedPayloadsActivity: chunkType === TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY ? expectedPayloads : null,
      receivedPayloadsDaily: 0,
      receivedPayloadsSleep: 0,
      receivedPayloadsActivity: 0,
      user,
      createdAt: new Date(),
    };

    this.chunks.set(terraHistoricalDataActiveSessionId, initialState);
  }

  /**
   * Process incoming chunk and check if aggregation is complete
   * Chunks can be of the same type - e.g., multiple "daily" chunks need to be merged
   */
  async processChunk(
    terraHistoricalDataActiveSessionId: TerraHistoricalDataSession['id'],
    payload: TerraDailyDataWebhookPayload | TerraSleepDataWebhookPayload | TerraActivityDataWebhookPayload,
    chunkType: TERRA_WEBHOOK_PAYLOAD_TYPE,
  ): Promise<void> {
    const historicalDataSession =
      await this.terraHistoricalDataSessionService.getTerraHistoricalDataActiveSessionByTerraUserId(
        payload.user.user_id,
      );
    if (!historicalDataSession) {
      this.logger.error(`Historical data session not found for user ${payload.user.user_id}`);
      return;
    }
    const state = this.chunks.get(terraHistoricalDataActiveSessionId);
    if (!state) {
      this.logger.error(
        `Received chunk for unknown reference: ${terraHistoricalDataActiveSessionId}. Creating new aggregation state.`,
      );
      return;
    }

    // Add chunk to appropriate array based on type

    switch (chunkType) {
      case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY:
        state.dailyChunks.push(payload as TerraAthleteDailyDataResponse);
        state.receivedPayloadsDaily++;
        break;
      case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP:
        state.sleepChunks.push(payload as TerraAthleteSleepDataResponse);
        state.receivedPayloadsSleep++;
        break;
      case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY:
        state.activityChunks.push(payload as TerraAthleteActivityDataResponse);
        state.receivedPayloadsActivity++;
        break;
      default:
        this.logger.error(`Unknown chunk type for reference ${terraHistoricalDataActiveSessionId}`);
        return;
    }
    historicalDataSession.receivedPayloadsDaily = state.receivedPayloadsDaily;
    historicalDataSession.receivedPayloadsSleep = state.receivedPayloadsSleep;
    historicalDataSession.receivedPayloadsActivity = state.receivedPayloadsActivity;

    await this.terraHistoricalDataSessionService.updateTerraHistoricalDataSessionByTerraUserId(
      payload.user.user_id,
      historicalDataSession,
    );
    this.logger.debug(
      `Chunk received for reference ${terraHistoricalDataActiveSessionId}: ${chunkType} (${payload.data.length} items). Progress: ${state.receivedPayloadsDaily}/${state.expectedPayloadsDaily != null ? state.expectedPayloadsDaily : 'unknown'}`,
    );

    // Emit chunk received event (useful for monitoring/debugging)
    this.eventEmitter.emit(
      TERRA_WEBHOOK_EVENTS.CHUNK_RECEIVED,
      new TerraWebhookChunkReceivedEvent(terraHistoricalDataActiveSessionId, payload, state.user),
    );

    // Check if we've received all expected payloads
    const hasReceivedExpectedCount =
      state.expectedPayloadsDaily != null &&
      state.receivedPayloadsDaily === state.expectedPayloadsDaily &&
      state.expectedPayloadsSleep != null &&
      state.receivedPayloadsSleep === state.expectedPayloadsSleep &&
      state.expectedPayloadsActivity != null &&
      state.receivedPayloadsActivity === state.expectedPayloadsActivity;

    //?  If we've received all expected payloads, merge and emit
    if (hasReceivedExpectedCount) {
      this.logger.log(
        `All chunks complete for reference ${terraHistoricalDataActiveSessionId}. Received ${state.receivedPayloadsDaily} daily payloads, ${state.receivedPayloadsSleep} sleep payloads, ${state.receivedPayloadsActivity} activity payloads. Daily chunks: ${state.dailyChunks.length}, Sleep chunks: ${state.sleepChunks.length}, Activity chunks: ${state.activityChunks.length}`,
      );

      // Merge chunks into final payloads
      const mergedPayloads = this.mergeChunks(state);

      // Emit completion event with merged data
      this.eventEmitter.emit(
        TERRA_WEBHOOK_EVENTS.CHUNKS_COMPLETE,
        new TerraWebhookChunksCompleteEvent(
          terraHistoricalDataActiveSessionId,
          state.user,
          mergedPayloads.daily,
          mergedPayloads.sleep,
          mergedPayloads.activity,
        ),
      );

      // Clean up this aggregation state
      this.chunks.delete(terraHistoricalDataActiveSessionId);
    } else {
      //?  Still waiting for more chunks
      this.logger.debug(
        `Waiting for more chunks for reference ${terraHistoricalDataActiveSessionId}. Received: ${state.receivedPayloadsDaily} daily payloads, ${state.receivedPayloadsSleep} sleep payloads, ${state.receivedPayloadsActivity} activity payloads. Daily chunks: ${state.dailyChunks.length}, Sleep chunks: ${state.sleepChunks.length}, Activity chunks: ${state.activityChunks.length}`,
      );
    }
  }

  /**
   * Merge all chunks of the same type into single payloads by combining their data arrays
   */
  private mergeChunks(state: ChunkAggregationState): {
    daily: TerraAthleteDailyDataResponse | null;
    sleep: TerraAthleteSleepDataResponse | null;
    activity: TerraAthleteActivityDataResponse | null;
  } {
    // Merge daily chunks
    const daily: TerraAthleteDailyDataResponse | null =
      state.dailyChunks.length > 0
        ? {
            status: 'success' as const,
            user: state.user,
            data: state.dailyChunks.flatMap((chunk) => chunk.data),
            type: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY,
          }
        : null;

    // Merge sleep chunks
    const sleep: TerraAthleteSleepDataResponse | null =
      state.sleepChunks.length > 0
        ? {
            status: 'success' as const,
            user: state.user,
            data: state.sleepChunks.flatMap((chunk) => chunk.data),
            type: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP,
          }
        : null;

    // Merge activity chunks
    const activity: TerraAthleteActivityDataResponse | null =
      state.activityChunks.length > 0
        ? {
            status: 'success' as const,
            user: state.user,
            data: state.activityChunks.flatMap((chunk) => chunk.data),
            type: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY,
          }
        : null;

    return { daily, sleep, activity };
  }

  /**
   * Get current state for a reference (useful for debugging/monitoring)
   */
  getState(reference: string): ChunkAggregationState | undefined {
    return this.chunks.get(reference);
  }

  /**
   * Get all active aggregation states (useful for monitoring)
   */
  getAllStates(): Map<string, ChunkAggregationState> {
    return new Map(this.chunks);
  }

  /**
   * Manually clear aggregation state for a reference (useful for testing/cleanup)
   */
  clearState(reference: string): void {
    this.chunks.delete(reference);
  }

  /**
   * Start the cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleChunks();
    }, this.CHUNK_TIMEOUT_MS);
  }

  /**
   * Clean up stale chunks that haven't been completed
   * Processes them as partial data if we have at least some chunks
   */
  private cleanupStaleChunks(): void {
    const now = new Date();
    const staleReferences: string[] = [];

    for (const [reference, state] of this.chunks.entries()) {
      const age = now.getTime() - state.createdAt.getTime();

      if (age > this.CHUNK_TIMEOUT_MS) {
        this.logger.warn(
          `Cleaning up stale chunk aggregation for reference ${reference} (age: ${Math.round(age / 1000)}s). Received: ${state.receivedPayloadsDaily} daily payloads, ${state.receivedPayloadsSleep} sleep payloads, ${state.receivedPayloadsActivity} activity payloads. Daily chunks: ${state.dailyChunks.length}, Sleep chunks: ${state.sleepChunks.length}, Activity chunks: ${state.activityChunks.length}`,
        );
        staleReferences.push(reference);
      }
    }

    // Process stale chunks - merge what we have and process it
    for (const reference of staleReferences) {
      const state = this.chunks.get(reference);
      if (state && (state.dailyChunks.length > 0 || state.sleepChunks.length > 0 || state.activityChunks.length > 0)) {
        // We have at least some chunks, merge and process them
        this.logger.log(
          `Processing stale chunk aggregation for reference ${reference} with available data (${state.dailyChunks.length} daily, ${state.sleepChunks.length} sleep, ${state.activityChunks.length} activity chunks)`,
        );

        const mergedPayloads = this.mergeChunks(state);

        this.eventEmitter.emit(
          TERRA_WEBHOOK_EVENTS.CHUNKS_COMPLETE,
          new TerraWebhookChunksCompleteEvent(
            reference,
            state.user,
            mergedPayloads.daily,
            mergedPayloads.sleep,
            mergedPayloads.activity,
          ),
        );
      } else if (state) {
        // No chunks received, just log and clean up
        this.logger.warn(`Stale chunk aggregation for reference ${reference} has no chunks. Discarding.`);
      }

      this.chunks.delete(reference);
    }

    if (staleReferences.length > 0) {
      this.logger.debug(`Cleaned up ${staleReferences.length} stale chunk aggregations`);
    }
  }
}
