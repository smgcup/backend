import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import type { TerraDailyDataItem, SleepDataItem, ActivityDataItem } from '../types';
import type { TerraUser } from '../types/terraUser.type';
import type {
  TerraAthleteDailyResponse,
  TerraAthleteSleepResponse,
  TerraAthleteActivityResponse,
  TerraErrorCode,
  TerraAuthenticationWidgetResponse,
  TerraAuthenticationWidgetSuccessResponse,
} from '../responses/terra-responses';
import { TERRA_HISTORICAL_DATA_MESSAGE } from '../responses/terra-responses';
import { TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM } from '../../webhook/terra/webhook-types';
import { Athlete } from '../../athlete/entities/athlete.entity';
@Injectable()
export class TerraApiClient {
  private readonly logger = new Logger(TerraApiClient.name);
  private readonly baseUrl = 'https://api.tryterra.co/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get the Terra API headers for authentication.
   * @returns The Terra API headers for authentication
   * @example
   * ```typescript
   * const headers = this.terraApiClient.getHeaders();
   * // Returns the Terra API headers for authentication
   * // { 'dev-id': '123e4567-e89b-12d3-a456-426614174000', 'x-api-key': '123e4567-e89b-12d3-a456-426614174000', 'Content-Type': 'application/json' }
   * ```
   */
  private getTerraApiHeaders() {
    const devId = this.configService.get<string>('TERRA_DEV_ID');
    const apiKey = this.configService.get<string>('TERRA_API_KEY');

    if (!devId || !apiKey) {
      this.logger.error('TERRA_STAGING_DEV_ID and TERRA_STAGING_API_KEY must be set');
      throw new Error('TERRA_STAGING_DEV_ID and TERRA_STAGING_API_KEY must be set');
    }
    return { 'dev-id': devId, 'x-api-key': apiKey, 'Content-Type': 'application/json' };
  }

  private getTerraAuthenticatonRedirectUrls() {
    const successUrl = this.configService.get<string>('TERRA_AUTH_SUCCESS_REDIRECT_URL');
    const failureUrl = this.configService.get<string>('TERRA_AUTH_FAILURE_REDIRECT_URL');

    if (!successUrl || !failureUrl) {
      this.logger.error('TERRA_AUTH_SUCCESS_REDIRECT_URL and TERRA_AUTH_FAILURE_REDIRECT_URL must be set');
      throw new Error('TERRA_AUTH_SUCCESS_REDIRECT_URL and TERRA_AUTH_FAILURE_REDIRECT_URL must be set');
    }
    return {
      successUrl,
      failureUrl,
    };
  }

  /**
   * Get the daily data for an athlete within a given date range.
   * @param terraUserId - The ID of the terra user to get the daily data for
   * @param startDate - The start date of the date range
   * @param endDate - The end date of the date range
   * @returns The daily data returned from the Terra API for the athlete within the given date range
   * @example
   * ```typescript
   * const dailyData = await this.terraApiClient.getAthleteDailyData('123e4567-e89b-12d3-a456-426614174000', new Date('2025-10-23'), new Date('2025-10-25'));
   * // Returns the daily data for the athlete within the given date range
   * // [
   * //   { date: '2025-10-23', recovery: 0.5, strain: 0.3, ... },
   * //   { date: '2025-10-24', recovery: 0.6, strain: 0.4, ... },
   * //   ...
   * ```
   */
  public async getAthleteDailyData(
    terraUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TerraAthleteDailyResponse> {
    try {
      const requestUrl = `${this.baseUrl}/daily?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&user_id=${terraUserId}&to_webhook=false`;
      this.logger.debug(`Athlete Daily Data Request URL: ${requestUrl}`);
      const response = await axios.get<{
        status: 'success' | 'error';
        user?: any;
        data?: any[];
        type?: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.DAILY | null;
        message?: string;
        reference?: string;
      }>(requestUrl, {
        headers: this.getTerraApiHeaders(),
      });

      if (response.data.message === TERRA_HISTORICAL_DATA_MESSAGE) {
        return {
          status: 'success' as const,
          user: response.data.user as TerraUser,
          reference: response.data.reference as string,
          type: response.data.type ?? null,
          message: TERRA_HISTORICAL_DATA_MESSAGE,
        };
      }

      // Return plain object for success response
      return {
        status: 'success' as const,
        user: response.data.user as TerraUser,
        data: response.data.data as TerraDailyDataItem[],
        type: response.data.type ?? null,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ status: string; message: string }>; // { status: string; message: string }
        const statusCode = ax.response?.status; // 400/401/404/429/5xx if available
        const responseData = ax.response?.data as { status: string; message: string }; // { status: string; message: string }
        const httpStatus = ax.code; // e.g., 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND'

        return {
          status: 'error' as const,
          message: responseData.message,
          code: httpStatus as TerraErrorCode,
          statusCode,
        };
      }

      // Non-Axios unexpected error
      if (error instanceof Error) {
        this.logger.error(`Unexpected error for ${terraUserId}: ${error.message}`, error.stack);
        return {
          status: 'error' as const,
          message: `Unexpected error: ${error.message}`,
          code: 'UNKNOWN' as TerraErrorCode,
          statusCode: 500,
        };
      }

      this.logger.error(`Unknown thrown value for ${terraUserId}: ${JSON.stringify(error)}`);
      return {
        status: 'error' as const,
        message: 'Unknown error occurred',
        code: 'UNKNOWN' as TerraErrorCode,
        statusCode: 500,
      };
    }
  }

  /**
   *
   * @param terraUserId - The ID of the terra user to get the sleep data for
   * @param startDate - The start date of the date range
   * @param endDate - The end date of the date range
   * @returns The sleep data returned from the Terra API for the athlete within the given date range
   * @example
   * ```typescript
   * const sleepData = await this.terraApiClient.getAthleteSleepData('123e4567-e89b-12d3-a456-426614174000', new Date('2025-10-23'), new Date('2025-10-25'));
   * // Returns the sleep data for the athlete within the given date range
   * // [
   * //   { date: '2025-10-23', sleep_duration: 420, sleep_efficiency: 0.85, ... },
   * //   { date: '2025-10-24', sleep_duration: 430, sleep_efficiency: 0.86, ... },
   * //   ...
   * ```
   * @returns The sleep data returned from the Terra API for the athlete within the given date range
   */
  public async getAthleteSleepData(
    terraUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TerraAthleteSleepResponse> {
    try {
      const requestUrl = `${this.baseUrl}/sleep?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&user_id=${terraUserId}&to_webhook=false`;
      this.logger.debug(`Athlete Sleep Data Request URL: ${requestUrl}`);
      const response = await axios.get<{
        status: 'success' | 'error';
        user?: any;
        data?: any[];
        type?: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.SLEEP | null;
        message?: string;
        reference?: string;
      }>(requestUrl, {
        headers: this.getTerraApiHeaders(),
      });

      if (response.data.message === TERRA_HISTORICAL_DATA_MESSAGE) {
        return {
          status: 'success' as const,
          user: response.data.user as TerraUser,
          reference: response.data.reference as string,
          type: response.data.type ?? null,
          message: TERRA_HISTORICAL_DATA_MESSAGE,
        };
      }

      return {
        status: 'success' as const,
        user: response.data.user as TerraUser,
        data: response.data.data as SleepDataItem[],
        type: response.data.type ?? null,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ status: string; message: string }>; // { status: string; message: string }
        const statusCode = ax.response?.status; // 400/401/404/429/5xx if available
        const responseData = ax.response?.data as { status: string; message: string }; // { status: string; message: string }
        const httpStatus = ax.code; // e.g., 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND'

        return {
          status: 'error' as const,
          message: responseData.message,
          code: httpStatus as TerraErrorCode,
          statusCode,
        };
      }

      // Non-Axios unexpected error
      if (error instanceof Error) {
        this.logger.error(`Unexpected error for ${terraUserId}: ${error.message}`, error.stack);
        return {
          status: 'error' as const,
          message: `Unexpected error: ${error.message}`,
          code: 'UNKNOWN' as TerraErrorCode,
          statusCode: 500,
        };
      }

      this.logger.error(`Unknown thrown value for ${terraUserId}: ${JSON.stringify(error)}`);
      return {
        status: 'error' as const,
        message: 'Unknown error occurred',
        code: 'UNKNOWN' as TerraErrorCode,
        statusCode: 500,
      };
    }
  }

  /**
   * Get the activity data for an athlete within a given date range.
   * @param terraUserId - The ID of the terra user to get the activity data for
   * @param startDate - The start date of the date range
   * @param endDate - The end date of the date range
   * @returns The activity data returned from the Terra API for the athlete within the given date range
   * @example
   * ```typescript
   * const activityData = await this.terraApiClient.getAthleteActivityData('123e4567-e89b-12d3-a456-426614174000', new Date('2025-10-23'), new Date('2025-10-25'));
   * // Returns the activity data for the athlete within the given date range
   * // [
   * //   { date: '2025-10-23', activity_duration: 420, activity_efficiency: 0.85, ... },
   * //   { date: '2025-10-24', activity_duration: 430, activity_efficiency: 0.86, ... },
   * //   ...
   * ```
   * @returns The activity data returned from the Terra API for the athlete within the given date range
   */
  public async getAthleteActivityData(
    terraUserId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TerraAthleteActivityResponse> {
    try {
      const requestUrl = `${this.baseUrl}/activity?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}&user_id=${terraUserId}&to_webhook=false`;
      this.logger.debug(`Athlete Activity Data Request URL: ${requestUrl}`);
      const response = await axios.get<{
        status: 'success' | 'error';
        user?: any;
        data?: any[];
        type?: typeof TERRA_WEBHOOK_PAYLOAD_TYPE_ENUM.ACTIVITY | null;
        message?: string;
        reference?: string;
      }>(requestUrl, {
        headers: this.getTerraApiHeaders(),
      });
      if (response.data.message === TERRA_HISTORICAL_DATA_MESSAGE) {
        return {
          status: 'success' as const,
          user: response.data.user as TerraUser,
          reference: response.data.reference as string,
          type: response.data.type ?? null,
          message: TERRA_HISTORICAL_DATA_MESSAGE,
        };
      }
      return {
        status: 'success' as const,
        user: response.data.user as TerraUser,
        data: response.data.data as ActivityDataItem[],
        type: response.data.type ?? null,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ status: string; message: string }>; // { status: string; message: string }
        const statusCode = ax.response?.status; // 400/401/404/429/5xx if available
        const responseData = ax.response?.data as { status: string; message: string }; // { status: string; message: string }
        const httpStatus = ax.code; // e.g., 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND'

        return {
          status: 'error' as const,
          message: responseData.message,
          code: httpStatus as TerraErrorCode,
          statusCode,
        };
      }

      // Non-Axios unexpected error
      if (error instanceof Error) {
        this.logger.error(`Unexpected error for ${terraUserId}: ${error.message}`, error.stack);
        return {
          status: 'error' as const,
          message: `Unexpected error: ${error.message}`,
          code: 'UNKNOWN' as TerraErrorCode,
          statusCode: 500,
        };
      }

      this.logger.error(`Unknown thrown value for ${terraUserId}: ${JSON.stringify(error)}`);
      return {
        status: 'error' as const,
        message: 'Unknown error occurred',
        code: 'UNKNOWN' as TerraErrorCode,
        statusCode: 500,
      };
    }
  }

  public async generateTerraAuthenticationWidgetUrl(
    athleteId: Athlete['id'],
  ): Promise<TerraAuthenticationWidgetResponse> {
    try {
      const { successUrl, failureUrl } = this.getTerraAuthenticatonRedirectUrls();

      const requestUrl = `${this.baseUrl}/auth/generateWidgetSession`;
      const response = await axios.post<TerraAuthenticationWidgetSuccessResponse>(
        requestUrl,
        {
          language: 'en',
          reference_id: athleteId,
          auth_success_redirect_url: successUrl,
          auth_failure_redirect_url: failureUrl,
        },
        {
          headers: this.getTerraApiHeaders(),
        },
      );
      return {
        status: 'success',
        session_id: response.data.session_id,
        url: response.data.url,
        expires_in: response.data.expires_in,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const ax = error as AxiosError<{ status: string; message: string }>; // { status: string; message: string }
        const statusCode = ax.response?.status; // 400/401/404/429/5xx if available
        const responseData = ax.response?.data as { status: string; message: string }; // { status: string; message: string }
        const httpStatus = ax.code; // e.g., 'ECONNABORTED', 'ETIMEDOUT', 'ENOTFOUND'
        return {
          status: 'error' as const,
          message: responseData.message,
          code: httpStatus as TerraErrorCode,
          statusCode,
        };
      }
      if (error instanceof Error) {
        this.logger.error(`Unexpected error for ${athleteId}: ${error.message}`, error.stack);
        return {
          status: 'error' as const,
          message: `Unexpected error: ${error.message}`,
          code: 'UNKNOWN' as TerraErrorCode,
          statusCode: 500,
        };
      }
      this.logger.error(`Unknown thrown value for ${athleteId}: ${JSON.stringify(error)}`);
      return {
        status: 'error' as const,
        message: 'Unknown error occurred',
        code: 'UNKNOWN' as TerraErrorCode,
        statusCode: 500,
      };
    }
  }
}
