import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { ConflictError, NotFoundError } from '../exception/exceptions';
import { TEAM_TRANSLATION_CODES } from '../exception/translation-codes';
import { CreateTeamDto } from './dto/create-team.dto';
import { generateUuidv7 } from '../shared/utils';
import { InternalServerError } from '../exception/exceptions';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PlayerService } from '../player/player.service';
import { TeamStatsService } from './team.stats.service';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @Inject(forwardRef(() => PlayerService))
    private playerService: PlayerService,
    private teamStatsService: TeamStatsService,
  ) {}

  /**
   * Method to get a team by its ID
   * @param id - The ID of the team to get
   * @param options - Additional find options (except where)
   * @returns The team with the given ID
   */
  async getTeamById(id: string, options: Omit<FindOneOptions<Team>, 'where'> = {}): Promise<Team> {
    const team = await this.teamRepository.findOne({ ...options, where: { id } });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFound);
    }
    return team;
  }

  /**
   * Method to get all teams
   * @returns All teams
   */
  async getTeams(leaderboardOrder: boolean = false) {
    const teams = await this.teamRepository.find({
      relations: leaderboardOrder ? { players: true } : undefined,
    });
    if (leaderboardOrder) {
      const playerIdsByTeam = (team: Team) => (Array.isArray(team.players) ? team.players.map((p) => p.id) : []);
      const entries = await Promise.all(
        teams.map(async (team) => {
          const playerIds = playerIdsByTeam(team);
          const [points, goals, goalsConceded, yellowCards, redCards] = await Promise.all([
            this.teamStatsService.getPoints(team.id),
            this.teamStatsService.getGoals(playerIds),
            this.teamStatsService.getGoalsConceded(team.id),
            this.teamStatsService.getYellowCards(playerIds),
            this.teamStatsService.getRedCards(playerIds),
          ]);
          return {
            team,
            points,
            goals,
            goalsConceded,
            goalDifference: goals - goalsConceded,
            yellowCards,
            redCards,
          };
        }),
      );
      const teamIds = entries.map((e) => e.team.id);
      const h2hMap = new Map<string, 1 | -1 | 0>();
      await Promise.all(
        teamIds.flatMap((idA, i) =>
          teamIds.slice(i + 1).map(async (idB) => {
            const result = await this.teamStatsService.getHeadToHeadResult(idA, idB);
            h2hMap.set(`${idA}-${idB}`, result);
            h2hMap.set(`${idB}-${idA}`, result === 0 ? 0 : result === 1 ? -1 : 1);
          }),
        ),
      );
      const sorted = entries.sort((a, b) => {
        if (a.points !== b.points) return b.points - a.points;
        const h2h = h2hMap.get(`${a.team.id}-${b.team.id}`) ?? 0;
        if (h2h !== 0) return h2h === 1 ? -1 : 1;
        if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
        if (a.goals !== b.goals) return b.goals - a.goals;
        if (a.redCards !== b.redCards) return a.redCards - b.redCards;
        return a.yellowCards - b.yellowCards;
      });
      return sorted.map((e) => e.team);
    }
    return teams;
  }

  /**
   * Method to create a new team
   * @param createTeamDto - The data for the new team
   * @returns The newly created team
   */
  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const existingTeam = await this.teamRepository.findOne({ where: { name: createTeamDto.name } });
    if (existingTeam) {
      throw new ConflictError(TEAM_TRANSLATION_CODES.teamNameAlreadyExists);
    }
    try {
      const team = this.teamRepository.create({
        id: generateUuidv7(),
        name: createTeamDto.name,
        createdAt: new Date(),
      });

      await this.teamRepository.save(team);

      return team;
    } catch {
      throw new InternalServerError(TEAM_TRANSLATION_CODES.teamCreationFailed);
    }
  }

  async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.getTeamById(id, { relations: { captain: true } });

    if (updateTeamDto.name && updateTeamDto.name !== team.name) {
      const existingTeam = await this.teamRepository.findOne({ where: { name: updateTeamDto.name } });
      if (existingTeam && existingTeam.id !== id) {
        throw new ConflictError(TEAM_TRANSLATION_CODES.teamNameAlreadyExists);
      }
    }

    const { captainId, ...patch } = updateTeamDto;
    Object.assign(team, patch);

    if (captainId) {
      const player = await this.playerService.getPlayerById(captainId, { relations: { team: true } });
      if (player.team?.id !== team.id) {
        throw new ConflictError(TEAM_TRANSLATION_CODES.captainMustBelongToTeam);
      }
      team.captain = player;
    }

    return await this.teamRepository.save(team);
  }

  async deleteTeam(id: string): Promise<Team> {
    const team = await this.getTeamById(id);
    await this.teamRepository.remove(team);
    return { ...team, id };
  }
}
