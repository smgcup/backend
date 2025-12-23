import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { PLAYER_TRANSLATION_CODES } from '../exception/translation-codes';
import { NotFoundError } from '../exception/exceptions';
import { CreatePlayerDto } from './dto/create-player.dto';
import { InternalServerError } from '../exception/exceptions';
import { generateUuidv7 } from '../shared/utils';
import { TeamService } from '../team/team.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
    private teamService: TeamService,
  ) {}

  /**
   * Method to get a player by its ID
   * @param id - The ID of the player to get
   * @returns The player with the given ID
   */
  async getPlayerById(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });
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
      return await this.playerRepository.save(player);
    } catch {
      throw new InternalServerError(PLAYER_TRANSLATION_CODES.playerCreationFailed);
    }
  }
}
