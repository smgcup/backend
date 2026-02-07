import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, In, Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { IMAGE_TRANSLATION_CODES, PLAYER_TRANSLATION_CODES } from '../exception/translation-codes';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { CreatePlayerDto } from './dto/create-player.dto';
import { generateUuidv7 } from '../shared/utils';
import { TeamService } from '../team/team.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { ImageService } from '../image/image.service';
import { LeaderboardSortType } from './enums/leaderboard-sort-type.enum';
import { PaginatedPlayersResponse } from './dto/paginated-players-response.dto';
import { PlayerPosition } from './enums/player-position.enum';
import { MatchEventType } from '../match-event/enums/match-event-type.enum';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { PlayerStatsService } from './player-stats.service';
import { Stats } from '../statistics/entities/stats.entity';

@Injectable()
export class PlayerService {
  private readonly playersCache = new Map<
    string,
    {
      result: Player[];
      timestamp: number;
    }
  >();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @InjectRepository(MatchEvent)
    private matchEventRepository: Repository<MatchEvent>,
    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService,
    private imageService: ImageService,
    private playerStatsService: PlayerStatsService,
  ) {}

  private async getPlayers(): Promise<Player[]> {
    const cached = this.playersCache.get('all');
    const now = Date.now();

    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }

    const allPlayers = await this.playerRepository.find({ relations: ['team'] });
    this.playersCache.set('all', {
      result: allPlayers,
      timestamp: now,
    });
    return allPlayers;
  }
  /**
   * Method to get a player by its ID
   * @param id - The ID of the player to get
   * @param options - Additional find options (except where)
   * @returns The player with the given ID
   */
  async getPlayerById(id: string, options: Omit<FindOneOptions<Player>, 'where'> = {}): Promise<Player> {
    const player = await this.playerRepository.findOne({ ...options, where: { id } });
    if (!player) {
      throw new NotFoundError(PLAYER_TRANSLATION_CODES.playerNotFound);
    }
    return player;
  }

  /**
   * Method to get all players by a team ID
   * @param teamId - The ID of the team to get players for
   * @returns The players for the given team
   */
  async getPlayersByTeamId(teamId: string): Promise<Player[]> {
    const players = await this.playerRepository.find({ where: { team: { id: teamId } } });
    return players;
  }

  /**
   * Method to create a new player
   * @param createPlayerDto - The data for the new player
   * @returns The newly created player
   */
  async createPlayer(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const team = await this.teamService.getTeamById(createPlayerDto.teamId);

    const player = this.playerRepository.create({
      id: generateUuidv7(),
      team,
      ...createPlayerDto,
    });
    try {
      const savedPlayer = await this.playerRepository.save(player);
      return savedPlayer;
    } catch {
      throw new InternalServerError(PLAYER_TRANSLATION_CODES.playerCreationFailed);
    }
  }

  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.getPlayerById(id);

    const { teamId, image, ...patch } = updatePlayerDto;
    Object.assign(player, patch);

    if (image) {
      const { mimeType } = image;
      const extension = mimeType?.split('/')[1];
      if (!mimeType || !extension) {
        throw new BadRequestError(IMAGE_TRANSLATION_CODES.invalidFileType);
      }

      const uploadedImage = await this.imageService.uploadFile({
        fileBase64: image.fileBase64,
        fileName: `${player.id}.${extension}`,
        mimeType,
        bucket: 'player-images',
      });

      player.imageUrl = uploadedImage.signedUrl;
    }

    if (teamId) {
      player.team = await this.teamService.getTeamById(teamId);
    }

    return await this.playerRepository.save(player);
  }

  async deletePlayer(id: string): Promise<Player> {
    const player = await this.getPlayerById(id);
    await this.playerRepository.remove(player);
    return player;
  }

  /**
   * Method to get players for leaderboard with pagination
   * @param sortBy - The stat to sort by
   * @param page - The page number (1-indexed)
   * @param limit - The number of players per page
   * @returns Paginated players response
   */
  async getPlayersLeaderboard(
    sortBy: LeaderboardSortType,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedPlayersResponse> {
    const offset = (page - 1) * limit;

    const allPlayers = await this.getPlayers();

    // For clean sheets, filter to only goalkeepers
    const players =
      sortBy === LeaderboardSortType.CLEAN_SHEETS
        ? allPlayers.filter((player) => player.position === PlayerPosition.GOALKEEPER)
        : allPlayers;

    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        const [goals, assists, yellowCards, redCards, cleanSheets] = await Promise.all([
          this.playerStatsService.getGoals(player.id),
          this.playerStatsService.getAssists(player.id),
          this.playerStatsService.getYellowCards(player.id),
          this.playerStatsService.getRedCards(player.id),
          this.playerStatsService.getCleanSheets(player),
        ]);
        return {
          ...player,
          age: player.age,
          stats: {
            goals,
            assists,
            yellowCards,
            redCards,
            cleanSheets,
          } as Stats,
        };
      }),
    );
    switch (sortBy) {
      case LeaderboardSortType.GOALS:
        playersWithStats.sort((a, b) => b.stats.goals - a.stats.goals);
        break;
      case LeaderboardSortType.ASSISTS:
        playersWithStats.sort((a, b) => b.stats.assists - a.stats.assists);
        break;
      case LeaderboardSortType.CLEAN_SHEETS:
        playersWithStats.sort((a, b) => b.stats.cleanSheets - a.stats.cleanSheets);
        break;
      case LeaderboardSortType.RED_CARDS:
        playersWithStats.sort((a, b) => b.stats.redCards - a.stats.redCards);
        break;
      case LeaderboardSortType.YELLOW_CARDS:
        playersWithStats.sort((a, b) => b.stats.yellowCards - a.stats.yellowCards);
        break;
      default:
        throw new BadRequestError(PLAYER_TRANSLATION_CODES.invalidSortType);
    }
    // // Apply sorting based on the stat type
    // const orderColumn = this.getOrderColumnForSortType(sortBy);
    // queryBuilder.orderBy(orderColumn, 'DESC');

    // // Get total count for pagination info
    // const totalCount = await queryBuilder.getCount();

    // // Apply pagination
    // const players = await queryBuilder.skip(offset).take(limit).getMany();

    const totalCount = playersWithStats.length;
    return {
      players: playersWithStats.slice(offset, offset + limit),
      totalCount,
      hasMore: offset + limit < totalCount,
    };
  }

  private getOrderColumnForSortType(sortBy: LeaderboardSortType): string {
    switch (sortBy) {
      case LeaderboardSortType.GOALS:
        return 'stats.goals';
      case LeaderboardSortType.ASSISTS:
        return 'stats.assists';
      case LeaderboardSortType.CLEAN_SHEETS:
        // For now, just return goalkeepers sorted by saves (placeholder)
        return 'stats.goalkeeperSaves';
      case LeaderboardSortType.RED_CARDS:
        return 'stats.redCards';
      case LeaderboardSortType.YELLOW_CARDS:
        return 'stats.yellowCards';
      default:
        return 'stats.goals';
    }
  }

  async getTopPlayers(): Promise<Player[]> {
    const matchEvents = await this.matchEventRepository.find({
      where: {
        type: In([
          MatchEventType.GOAL,
          MatchEventType.PENALTY_SCORED,
          MatchEventType.YELLOW_CARD,
          MatchEventType.RED_CARD,
          MatchEventType.OWN_GOAL,
        ]),
      },
      relations: ['player', 'player.team', 'assistPlayer', 'assistPlayer.team'],
    });

    const goals = new Map<string, number>();
    const assists = new Map<string, number>();
    const redCards = new Map<string, number>();
    const yellowCards = new Map<string, number>();
    const ownGoals = new Map<string, number>();
    const playerInfo = new Map<string, { player: Player; team: { id: string; name: string } }>();

    const ensurePlayer = (p: Player | null, team: { id: string; name: string } | undefined) => {
      if (!p?.id || !team) return;
      if (!playerInfo.has(p.id)) playerInfo.set(p.id, { player: p, team });
    };

    for (const event of matchEvents) {
      if (event.playerId) {
        ensurePlayer(event.player ?? null, event.player?.team as { id: string; name: string } | undefined);
        switch (event.type) {
          case MatchEventType.GOAL:
          case MatchEventType.PENALTY_SCORED:
            goals.set(event.playerId, (goals.get(event.playerId) ?? 0) + 1);
            break;
          case MatchEventType.YELLOW_CARD:
            yellowCards.set(event.playerId, (yellowCards.get(event.playerId) ?? 0) + 1);
            break;
          case MatchEventType.RED_CARD:
            redCards.set(event.playerId, (redCards.get(event.playerId) ?? 0) + 1);
            break;
          case MatchEventType.OWN_GOAL:
            ownGoals.set(event.playerId, (ownGoals.get(event.playerId) ?? 0) + 1);
            break;
        }
      }
      if (event.type === MatchEventType.GOAL && event.assistPlayerId) {
        ensurePlayer(event.assistPlayer ?? null, event.assistPlayer?.team as { id: string; name: string } | undefined);
        assists.set(event.assistPlayerId, (assists.get(event.assistPlayerId) ?? 0) + 1);
      }
    }

    const allPlayerIds = new Set([
      ...goals.keys(),
      ...assists.keys(),
      ...redCards.keys(),
      ...yellowCards.keys(),
      ...ownGoals.keys(),
    ]);

    const missingIds = [...allPlayerIds].filter((id) => !playerInfo.has(id));
    if (missingIds.length > 0) {
      const missing = await this.playerRepository.find({
        where: { id: In(missingIds) },
        relations: ['team'],
      });
      for (const p of missing) {
        if (p.team) playerInfo.set(p.id, { player: p, team: p.team });
      }
    }

    const withStats = [...allPlayerIds]
      .map((id) => playerInfo.get(id))
      .filter((info): info is NonNullable<typeof info> => info != null);

    const sorted = withStats
      .map(({ player, team }) => ({
        player,
        team,
        goals: goals.get(player.id) ?? 0,
        assists: assists.get(player.id) ?? 0,
        redCards: redCards.get(player.id) ?? 0,
        yellowCards: yellowCards.get(player.id) ?? 0,
        ownGoals: ownGoals.get(player.id) ?? 0,
      }))
      .sort((a, b) => {
        const goalsPlusAssistsA = a.goals + a.assists;
        const goalsPlusAssistsB = b.goals + b.assists;
        if (goalsPlusAssistsB !== goalsPlusAssistsA) return goalsPlusAssistsB - goalsPlusAssistsA;
        if (b.goals !== a.goals) return b.goals - a.goals;
        const nameA = `${a.player.lastName} ${a.player.firstName}`.toLowerCase();
        const nameB = `${b.player.lastName} ${b.player.firstName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .slice(0, 5);

    return sorted.map(({ player }) => player);
  }
}
