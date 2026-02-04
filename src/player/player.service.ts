import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { IMAGE_TRANSLATION_CODES, PLAYER_TRANSLATION_CODES } from '../exception/translation-codes';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { CreatePlayerDto } from './dto/create-player.dto';
import { generateUuidv7 } from '../shared/utils';
import { TeamService } from '../team/team.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerStatsService } from './player-stats.service';
import { ImageService } from '../image/image.service';
import { LeaderboardSortType } from './enums/leaderboard-sort-type.enum';
import { PaginatedPlayersResponse } from './dto/paginated-players-response.dto';
import { PlayerPosition } from './enums/player-position.enum';
@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService,
    private playerStatsService: PlayerStatsService,
    private imageService: ImageService,
  ) {}

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
      // await this.playerStatsService.createEmptyStats(savedPlayer.id);
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

    const queryBuilder = this.playerRepository
      .createQueryBuilder('player')
      .leftJoinAndSelect('player.stats', 'stats')
      .leftJoinAndSelect('player.team', 'team');

    // For clean sheets, filter to only goalkeepers
    if (sortBy === LeaderboardSortType.CLEAN_SHEETS) {
      queryBuilder.where('player.position = :position', {
        position: PlayerPosition.GOALKEEPER,
      });
    }

    // Apply sorting based on the stat type
    const orderColumn = this.getOrderColumnForSortType(sortBy);
    queryBuilder.orderBy(orderColumn, 'DESC');

    // Get total count for pagination info
    const totalCount = await queryBuilder.getCount();

    // Apply pagination
    const players = await queryBuilder.skip(offset).take(limit).getMany();

    return {
      players,
      totalCount,
      hasMore: offset + players.length < totalCount,
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
}
