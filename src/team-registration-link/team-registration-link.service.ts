import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from '../team/entities/team.entity';
import { TeamRegistrationLink } from './entities/team-registration-link.entity';
import { Repository } from 'typeorm';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';
// import { AthleteRegistrationInProcess } from '../athlete/entities/athlete-registration-in-proccess.entity';
import { Athlete } from '../athlete/entities/athlete.entity';
import { isErrorResponse } from '../terra/responses/terra-responses';
import { TerraApiClient } from '../terra/client/terra-api-client';
import { TerraAuthenticationWidgetUrlResponse } from './entities/terra-authentication-widget-url-response.entity';
import { BadRequestError, NotFoundError, InternalServerError } from '../exception/exceptions';
import { TEAM_REGISTRATION_LINK_TRANSLATION_CODES, ATHLETE_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class TeamRegistrationLinkService {
  private readonly logger = new Logger(TeamRegistrationLinkService.name);

  constructor(
    @InjectRepository(TeamRegistrationLink)
    private readonly teamRegistrationLinkRepository: Repository<TeamRegistrationLink>,
    @InjectRepository(Athlete)
    private readonly athleteRepository: Repository<Athlete>,
    private readonly terraApiClient: TerraApiClient,
  ) {}

  /**
   * Create a team registration link for a team
   * @param teamId - The ID of the team to create a registration link for
   * @returns The created team registration link
   */
  async createTeamRegistrationLink(teamId: Team['id']): Promise<TeamRegistrationLink> {
    try {
      const teamRegistrationLink = this.teamRegistrationLinkRepository.create({
        id: generateUuidv7(),
        team: { id: teamId },
        token: this.generateToken(),
        createdAt: new Date(),
        expiryTimestamp: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      });
      return await this.teamRegistrationLinkRepository.save(teamRegistrationLink);
    } catch (error) {
      throw new InternalServerError(
        TEAM_REGISTRATION_LINK_TRANSLATION_CODES.createTeamRegistrationLinkFailed,
        `Failed to create team registration link: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get the team for a registration link
   * @param registrationLinkId - The ID of the registration link to get the team for
   * @returns The team for the registration link
   */
  async getTeamForRegistrationLink(registrationLinkId: string): Promise<Team> {
    const link = await this.teamRegistrationLinkRepository.findOne({
      where: { id: registrationLinkId },
      relations: ['team'],
    });

    if (!link || !link.team) {
      throw new NotFoundError(
        TEAM_REGISTRATION_LINK_TRANSLATION_CODES.teamNotFoundForRegistrationLink,
        `Team not found for registration link ${registrationLinkId}`,
      );
    }

    return link.team;
  }

  generateToken(): string {
    const token = crypto.randomBytes(24).toString('base64url'); // 32 chars safe for URLs
    this.logger.debug(`Token generated: ${token}`);
    return token;
  }

  // TODO: Add better error handling for different error responses
  /**
   * Get the team for a registration link token
   * @param token - The token of the registration link to get the team for
   * @returns The team for the registration link
   */
  async getTeamByRegistrationLinkToken(token: string): Promise<Team> {
    try {
      const link = await this.teamRegistrationLinkRepository.findOne({
        where: { token },
        relations: ['team'],
      });

      if (!link || !link.team) {
        throw new NotFoundError(
          TEAM_REGISTRATION_LINK_TRANSLATION_CODES.registrationLinkExpired,
          'The registration link token is invalid or has expired',
        );
      }

      return link.team;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new BadRequestError(
        TEAM_REGISTRATION_LINK_TRANSLATION_CODES.getTeamByRegistrationLinkTokenFailed,
        `Failed to get team by registration link token: ${error}`,
      );
    }
  }

  /**
   * Generate a Terra authentication widget URL for an athlete
   * @param athleteId - The ID of the athlete to generate a Terra authentication widget URL for
   * @returns The Terra authentication widget URL response object
   */
  async requestAthleteWearableConnectionSession(
    athleteId: Athlete['id'],
  ): Promise<TerraAuthenticationWidgetUrlResponse> {
    this.logger.debug(`Generating Terra authentication widget URL for athlete ${athleteId}`);

    const athlete = await this.athleteRepository.findOne({
      where: { id: athleteId },
    });

    //? Check if the athlete exists
    if (!athlete) {
      throw new NotFoundError(ATHLETE_TRANSLATION_CODES.athleteNotFound, `Athlete not found for athlete ${athleteId}`);
    }

    //? Check if the athlete already has a Terra ID - has already connected their wearable
    if (athlete.terraId) {
      throw new BadRequestError(
        ATHLETE_TRANSLATION_CODES.athleteTerraIdAlreadyExists,
        `Athlete ${athleteId} already has a Terra ID`,
      );
    }
    try {
      const response = await this.terraApiClient.generateTerraAuthenticationWidgetUrl(athleteId);
      if (isErrorResponse(response)) {
        this.logger.error(`Failed to generate Terra authentication widget URL: ${response.message}`);
        throw new BadRequestError(
          TEAM_REGISTRATION_LINK_TRANSLATION_CODES.terraAuthenticationWidgetUrlFailed,
          response.message,
        );
      }
      return { url: response.url };
    } catch (error) {
      this.logger.error(`Failed to generate Terra authentication widget URL: ${error}`);
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      throw new BadRequestError(
        TEAM_REGISTRATION_LINK_TRANSLATION_CODES.terraAuthenticationWidgetUrlFailed,
        `Failed to generate Terra authentication widget URL: ${error}`,
      );
    }
  }
}
