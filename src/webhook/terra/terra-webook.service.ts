import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  isLargeRequestProcessingPayload,
  isLargeRequestSendingPayload,
  isDailyDataPayload,
  isSleepDataPayload,
  isActivityDataPayload,
  TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM,
  TERRA_WEBHOOK_PAYLOAD_TYPE,
  TerraWebhookPayload,
} from './webhook-types';
import { TerraChunkAggregatorService } from './services/terra-chunk-aggregator.service';
import { TerraHistoricalDataSessionService } from '../../terra/terra-historical-data-session.service';
import {
  isAuthenticationResponse,
  isErrorAuthenticationResponse,
  isSuccessAuthenticationResponse,
} from '../../terra/responses/terra-responses';
import { Athlete } from '../../athlete/entities/athlete.entity';
import { BadRequestError } from '../../exception/exceptions';
import { AthleteActionLogService } from '../../athlete/athlete-action-log.service';
import { constructAthleteActionLog } from '../../athlete/helpers/create-athlete-action-log.helper';
import { AthleteActionType } from '../../athlete/enums/athlete-action-type.enum';
@Injectable()
export class TerraWebhookService {
  private readonly logger = new Logger(TerraWebhookService.name);

  constructor(
    private readonly chunkAggregator: TerraChunkAggregatorService,
    private readonly terraHistoricalDataSessionService: TerraHistoricalDataSessionService,
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    private readonly dataSource: DataSource,
    private readonly athleteActionLogService: AthleteActionLogService,
  ) {}

  async handleTerraWebhook(payload: TerraWebhookPayload, terraReference?: string): Promise<void> {
    //? We are going to get 3 such requests for daily, sleep and activity
    if (isLargeRequestProcessingPayload(payload)) {
      this.logger.debug(`Large request processing: ${payload.reference}`);
      const terraUser = payload.user;
      const terraHistoricalDataActiveSession =
        await this.terraHistoricalDataSessionService.getTerraHistoricalDataActiveSessionByTerraUserId(
          terraUser.user_id,
        );

      if (!terraHistoricalDataActiveSession) {
        this.logger.warn('Terra historical data session not found for terra user line 33');
        return;
      }
      if (terraReference) {
        for (const key of ['terraDailyReference', 'terraSleepReference', 'terraActivityReference'] as const) {
          if (!terraHistoricalDataActiveSession[key]) {
            terraHistoricalDataActiveSession[key] = terraReference;
            break;
          }
        }
        const updatedTerraHistoricalDataSession =
          await this.terraHistoricalDataSessionService.updateTerraHistoricalDataSessionByTerraUserId(
            terraUser.user_id,
            terraHistoricalDataActiveSession,
          );
        if (!updatedTerraHistoricalDataSession) {
          this.logger.warn('Failed to update terra historical data session for terra user line 49');
          return;
        }
      } else {
        this.logger.warn('Terra reference not found in large request-processing-payload');
        return;
      }

      return;
    }

    //? We are going to get 3 such requests for daily, sleep and activity
    if (isLargeRequestSendingPayload(payload)) {
      // Initialize aggregation tracking
      const terraUser = payload.user;
      const terraHistoricalDataActiveSession =
        await this.terraHistoricalDataSessionService.getTerraHistoricalDataActiveSessionByTerraUserId(
          terraUser.user_id,
        );
      const terraReference = payload.reference;

      if (!terraHistoricalDataActiveSession) {
        this.logger.warn('Terra historical data session not found for terra user');
        return;
      }

      //?  Update the expected payloads in the terra historical data session
      // Since only one of the 3 keys will be not null, we can determine the payload type
      const refToFieldAndTypeMap = {
        terraDailyReference: {
          fieldKey: 'expectedPayloadsDaily' as const,
          payloadType: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY,
        },
        terraSleepReference: {
          fieldKey: 'expectedPayloadsSleep' as const,
          payloadType: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP,
        },
        terraActivityReference: {
          fieldKey: 'expectedPayloadsActivity' as const,
          payloadType: TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY,
        },
      } as const;

      let payloadType: TERRA_WEBHOOK_PAYLOAD_TYPE | undefined;
      for (const [refKey, { fieldKey, payloadType: type }] of Object.entries(refToFieldAndTypeMap)) {
        if (terraReference === terraHistoricalDataActiveSession[refKey]) {
          payloadType = type;
          const currentValue = terraHistoricalDataActiveSession[fieldKey];
          if (currentValue == null) {
            terraHistoricalDataActiveSession[fieldKey] = payload.expected_payloads;
          }
          break;
        }
      }

      if (payloadType) {
        this.logger.debug(
          `Large request sending: ${payload.reference}, payload type: ${payloadType}, expected payloads: ${payload.expected_payloads}`,
        );
      }

      const updatedTerraHistoricalDataSession =
        await this.terraHistoricalDataSessionService.updateTerraHistoricalDataSessionByTerraUserId(
          terraUser.user_id,
          terraHistoricalDataActiveSession,
        );

      if (!payloadType) {
        this.logger.error('Payload type not found in large request sending payload line 119');
        this.logger.debug('Payload: ', payload);
        return;
      }
      //?  Initialize the chunk aggregator for the new terra payload
      this.chunkAggregator.initializeAggregation(
        terraHistoricalDataActiveSession.id,
        payloadType,
        payload.expected_payloads,
        terraUser,
      );
      if (!updatedTerraHistoricalDataSession) {
        this.logger.warn('Failed to update terra historical data session for terra user');
        return;
      }
      return;
    }

    // Handle data chunks payloads

    if (isDailyDataPayload(payload) || isSleepDataPayload(payload) || isActivityDataPayload(payload)) {
      //? Process the data payload
      const terraUserId = payload.user.user_id;
      const terraHistoricalDataActiveSession =
        await this.terraHistoricalDataSessionService.getTerraHistoricalDataActiveSessionByTerraUserId(terraUserId);
      if (!terraHistoricalDataActiveSession) {
        this.logger.warn('Received data payload for a user without a session, user ID: ', terraUserId);
        return;
      }
      let webhookPayloadType: TERRA_WEBHOOK_PAYLOAD_TYPE;
      switch (payload.type) {
        case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY:
          webhookPayloadType = TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY;
          break;
        case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP:
          webhookPayloadType = TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP;
          break;
        case TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY:
          webhookPayloadType = TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY;
          break;
        default:
          this.logger.error('Unknown webhook payload type:', payload);
          return;
      }
      await this.chunkAggregator.processChunk(terraHistoricalDataActiveSession.id, payload, webhookPayloadType);
    }

    if (isAuthenticationResponse(payload)) {
      if (isSuccessAuthenticationResponse(payload)) {
        //? Fill the athlete terraId with the terra user id
        const terraUserId = payload.user.user_id,
          referenceId = payload.reference_id;
        try {
          await this.dataSource.transaction(async (manager) => {
            const athlete = await manager.findOne(Athlete, {
              where: {
                id: referenceId,
              },
              relations: ['team'],
            });
            if (!athlete) {
              this.logger.warn('Athlete in process not found for reference id:', referenceId);
              return;
            }
            athlete.terraId = terraUserId;

            const actionLog = constructAthleteActionLog(athlete.id, AthleteActionType.WEARABLE_CONNECTION, null);

            await this.athleteActionLogService.createAthleteActionLog(actionLog);

            await manager.save(Athlete, athlete);
          });
        } catch (error) {
          throw new BadRequestError(undefined, `Failed to register athlete for reference id: ${referenceId}, ${error}`);
        }
        this.logger.debug(`Athlete registered successfully for reference id: ${referenceId}`);
        return;
      }
      if (isErrorAuthenticationResponse(payload)) {
        // TODO: Think of the logic we want to do if the user has entered incorrect credentials in the Terra Auth Widget
        return;
      }
    }

    //?  Unknown terra webhook payload type
    this.logger.error('Unknown terra webhook payload type:', payload);
    return;
  }
}
