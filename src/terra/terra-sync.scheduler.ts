import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { TerraSyncService } from './terra-sync.service';
import { TeamService } from '../team/team.service';

@Injectable()
export class TerraSyncScheduler implements OnModuleInit {
  private readonly logger = new Logger(TerraSyncScheduler.name);

  constructor(
    private readonly terraSyncService: TerraSyncService,
    private readonly teamService: TeamService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    // Set up the interval based on configuration
    const intervalMinutes = this.configService.get<string>('TERRA_SYNC_INTERVAL_MINUTES');
    const intervalMs = intervalMinutes ? parseInt(intervalMinutes, 10) * 60 * 1000 : 60 * 60 * 1000; // Default: 60 minutes

    this.logger.log(`Setting up scheduled sync with interval: ${intervalMs / 1000 / 60} minutes`);

    const interval = setInterval(() => {
      void this.handleSyncTeamAthletes();
    }, intervalMs);

    this.schedulerRegistry.addInterval('syncTeamAthletes', interval);
  }

  get endDate(): Date {
    return new Date();
  }

  get startDate(): Date {
    const periodDays = this.configService.get<string>('TERRA_CONTINUES_SYNC_PERIOD_DAYS');
    if (!periodDays) {
      throw new Error('TERRA_CONTINUES_SYNC_PERIOD_DAYS is not set in the .env');
    }
    const periodDaysInt = parseInt(periodDays, 10);
    const date = new Date();
    date.setDate(date.getDate() - periodDaysInt);
    return date;
  }

  /**
   * Scheduled task to sync all teams' athletes at regular intervals.
   * The interval is configured via TERRA_SYNC_INTERVAL_MINUTES environment variable.
   * Defaults to 60 minutes if not set.
   */
  async handleSyncTeamAthletes() {
    this.logger.log("Scheduled sync for all teams' athletes started");

    try {
      const teams = await this.teamService.getAllTeams();
      this.logger.log(`Found ${teams.length} teams to sync`);

      for (const team of teams) {
        const teamAthletes = await this.teamService.getTeamAthletes(team.id);
        this.logger.log(`Syncing ${teamAthletes.length} athletes for team ${team.id}`);

        // Start the async sync process for each athlete without waiting for completion
        teamAthletes
          .filter((athlete) => athlete.terraId)
          .forEach((athlete) => {
            this.terraSyncService.syncSingleAthlete(athlete.id, this.startDate, this.endDate).catch((error) => {
              this.logger.error(`Error in scheduled sync for athlete ${athlete.id}:`, error);
            });
          });
      }

      this.logger.log("Scheduled sync for all teams' athletes completed");
    } catch (error) {
      this.logger.error("Error in scheduled sync for all teams' athletes:", error);
    }
  }
}
