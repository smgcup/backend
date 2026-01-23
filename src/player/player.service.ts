import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { PLAYER_TRANSLATION_CODES } from '../exception/translation-codes';
import { NotFoundError } from '../exception/exceptions';
import { CreatePlayerDto } from './dto/create-player.dto';
import { InternalServerError } from '../exception/exceptions';
import { generateUuidv7 } from '../shared/utils';
import { TeamService } from '../team/team.service';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerStatsService } from './player-stats.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    @Inject(forwardRef(() => TeamService))
    private teamService: TeamService,
    private playerStatsService: PlayerStatsService,
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
      await this.playerStatsService.createEmptyStats(savedPlayer.id);
      return savedPlayer;
    } catch {
      throw new InternalServerError(PLAYER_TRANSLATION_CODES.playerCreationFailed);
    }
  }

  async updatePlayer(id: string, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const player = await this.getPlayerById(id);

    const { teamId, ...patch } = updatePlayerDto;
    Object.assign(player, patch);

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
}
