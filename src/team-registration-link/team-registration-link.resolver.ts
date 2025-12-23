import { Resolver, ResolveField, Parent, Args, Query, Mutation, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TeamRegistrationLinkService } from './team-registration-link.service';
import { TeamRegistrationLink } from './entities/team-registration-link.entity';
import { Team } from '../team/entities/team.entity';
import { Logger } from '@nestjs/common';
import { TerraAuthenticationWidgetUrlResponse } from './entities/terra-authentication-widget-url-response.entity';
import { JwtAuthGuard } from '../account/guards/jwt-auth.guard';
import { AccountSession } from '../account/decorators/account-session.decorator';
import { Account } from '../account/entities/account.entity';
import { AthleteService } from '../athlete/athlete.service';

@Resolver(() => TeamRegistrationLink)
export class TeamRegistrationLinkResolver {
  private readonly logger = new Logger(TeamRegistrationLinkResolver.name);
  constructor(
    private readonly teamRegistrationLinkService: TeamRegistrationLinkService,
    private readonly athleteService: AthleteService,
  ) {}

  /**
   * Get the team for a registration link
   * @param teamRegistrationLink - The team registration link to get the team for
   * @returns The team for the registration link
   */
  @ResolveField(() => Team, { nullable: false })
  async team(@Parent() teamRegistrationLink: TeamRegistrationLink): Promise<Team> {
    // This will only be called if 'team' field is requested in the GraphQL query
    return await this.teamRegistrationLinkService.getTeamForRegistrationLink(teamRegistrationLink.id);
  }

  // TODO: Add better error handling for different error responses
  /**
   * Get the team for a registration link token
   * @param token - The token of the registration link to get the team for
   * @returns The team for the registration link
   */
  @Query(() => Team, { name: 'getTeamByRegistrationLinkToken', nullable: false })
  async getTeamByRegistrationLinkToken(@Args('token', { type: () => String }) token: string): Promise<Team> {
    return await this.teamRegistrationLinkService.getTeamByRegistrationLinkToken(token);
  }

  /**
   * Generate a Terra authentication widget URL for an athlete
   * @param athleteId - The ID of the athlete to generate a Terra authentication widget URL for
   * @returns The Terra authentication widget URL response object
   */
  @Mutation(() => TerraAuthenticationWidgetUrlResponse, {
    name: 'requestAthleteWearableConnectionSession',
    nullable: false,
  })
  @UseGuards(JwtAuthGuard)
  async requestAthleteWearableConnectionSession(
    @AccountSession() account: Account,
  ): Promise<TerraAuthenticationWidgetUrlResponse> {
    const athlete = await this.athleteService.getAthleteByAccountId(account.id);
    return await this.teamRegistrationLinkService.requestAthleteWearableConnectionSession(athlete.id);
  }
}
