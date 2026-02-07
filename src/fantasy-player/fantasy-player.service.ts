import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FantasyPlayer } from './entities/fantasy-player.entity';
import { FANTASY_PLAYER_TRANSLATION_CODES } from '../exception/translation-codes';
import { InternalServerError, NotFoundError } from '../exception/exceptions';
import { CreateFantasyPlayerDto } from './dto/create-fantasy-player.dto';
import { UpdateFantasyPlayerDto } from './dto/update-fantasy-player.dto';
import { PlayerService } from '../player/player.service';

@Injectable()
export class FantasyPlayerService {
  constructor(
    @InjectRepository(FantasyPlayer)
    private fantasyPlayerRepository: Repository<FantasyPlayer>,
    private playerService: PlayerService,
  ) {}

  async getFantasyPlayerByPlayerId(playerId: string): Promise<FantasyPlayer> {
    const fantasyPlayer = await this.fantasyPlayerRepository.findOne({
      where: { playerId },
      relations: ['player'],
    });
    if (!fantasyPlayer) {
      throw new NotFoundError(FANTASY_PLAYER_TRANSLATION_CODES.fantasyPlayerNotFound);
    }
    return fantasyPlayer;
  }

  async getAllFantasyPlayers(): Promise<FantasyPlayer[]> {
    return await this.fantasyPlayerRepository.find({ relations: ['player'] });
  }

  async createFantasyPlayer(createFantasyPlayerDto: CreateFantasyPlayerDto): Promise<FantasyPlayer> {
    await this.playerService.getPlayerById(createFantasyPlayerDto.playerId);

    const fantasyPlayer = this.fantasyPlayerRepository.create({
      playerId: createFantasyPlayerDto.playerId,
      displayName: createFantasyPlayerDto.displayName,
      price: createFantasyPlayerDto.price,
    });

    try {
      return await this.fantasyPlayerRepository.save(fantasyPlayer);
    } catch {
      throw new InternalServerError(FANTASY_PLAYER_TRANSLATION_CODES.fantasyPlayerCreationFailed);
    }
  }

  async updateFantasyPlayer(playerId: string, updateFantasyPlayerDto: UpdateFantasyPlayerDto): Promise<FantasyPlayer> {
    const fantasyPlayer = await this.getFantasyPlayerByPlayerId(playerId);
    Object.assign(fantasyPlayer, updateFantasyPlayerDto);
    return await this.fantasyPlayerRepository.save(fantasyPlayer);
  }

  async deleteFantasyPlayer(playerId: string): Promise<FantasyPlayer> {
    const fantasyPlayer = await this.getFantasyPlayerByPlayerId(playerId);
    await this.fantasyPlayerRepository.remove(fantasyPlayer);
    return fantasyPlayer;
  }
}
