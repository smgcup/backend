import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAppearance } from './entities/player-appearance.entity';
import { UpdatePlayerAppearanceDto } from './dto/update-player-appearance.dto';
import { CreateAllPlayerAppearancesDto } from './dto/create-all-player-appearances.dto';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { PLAYER_APPEARANCE_TRANSLATION_CODES } from '../exception/translation-codes';
import { MatchService } from '../match/match.service';
import { PlayerService } from '../player/player.service';

@Injectable()
export class PlayerAppearanceService {
  constructor(
    @InjectRepository(PlayerAppearance)
    private readonly playerAppearanceRepository: Repository<PlayerAppearance>,
    private readonly matchService: MatchService,
    private readonly playerService: PlayerService,
  ) {}

  async getAppearancesByMatchId(matchId: string): Promise<PlayerAppearance[]> {
    return await this.playerAppearanceRepository.find({
      where: { matchId },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        player: { team: true },
      },
      order: { createdAt: 'ASC' },
    });
  }

  async getAppearancesByPlayerId(playerId: string): Promise<PlayerAppearance[]> {
    return await this.playerAppearanceRepository.find({
      where: { playerId },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        player: { team: true },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async createAllAppearances(dto: CreateAllPlayerAppearancesDto): Promise<PlayerAppearance[]> {
    const match = await this.matchService.getMatchById(dto.matchId);

    const results: PlayerAppearance[] = [];

    for (const appearanceInput of dto.appearances) {
      const player = await this.playerService.getPlayerById(appearanceInput.playerId, { relations: { team: true } });

      const isPlayerInMatch = player.team.id === match.firstOpponent.id || player.team.id === match.secondOpponent.id;
      if (!isPlayerInMatch) {
        throw new BadRequestError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerNotInMatchTeam);
      }

      const existing = await this.playerAppearanceRepository.findOne({
        where: { matchId: dto.matchId, playerId: appearanceInput.playerId },
      });

      if (existing) {
        existing.level = appearanceInput.level;
        await this.playerAppearanceRepository.save(existing);
        results.push(await this.getAppearanceByIds(dto.matchId, appearanceInput.playerId));
      } else {
        const appearance = this.playerAppearanceRepository.create({
          matchId: dto.matchId,
          playerId: appearanceInput.playerId,
          level: appearanceInput.level,
          createdAt: new Date(),
        });
        await this.playerAppearanceRepository.save(appearance);
        results.push(await this.getAppearanceByIds(dto.matchId, appearanceInput.playerId));
      }
    }

    return results;
  }

  async updateAppearance(dto: UpdatePlayerAppearanceDto): Promise<PlayerAppearance> {
    const appearance = await this.playerAppearanceRepository.findOne({
      where: { matchId: dto.matchId, playerId: dto.playerId },
    });

    if (!appearance) {
      throw new NotFoundError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerAppearanceNotFound);
    }

    try {
      appearance.level = dto.level;
      await this.playerAppearanceRepository.save(appearance);
      return await this.getAppearanceByIds(dto.matchId, dto.playerId);
    } catch {
      throw new InternalServerError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerAppearanceUpdateFailed);
    }
  }

  async deleteAppearance(matchId: string, playerId: string): Promise<boolean> {
    const appearance = await this.playerAppearanceRepository.findOne({
      where: { matchId, playerId },
    });

    if (!appearance) {
      throw new NotFoundError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerAppearanceNotFound);
    }

    try {
      await this.playerAppearanceRepository.remove(appearance);
      return true;
    } catch {
      throw new InternalServerError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerAppearanceDeletionFailed);
    }
  }

  private async getAppearanceByIds(matchId: string, playerId: string): Promise<PlayerAppearance> {
    const appearance = await this.playerAppearanceRepository.findOne({
      where: { matchId, playerId },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        player: { team: true },
      },
    });

    if (!appearance) {
      throw new NotFoundError(PLAYER_APPEARANCE_TRANSLATION_CODES.playerAppearanceNotFound);
    }

    return appearance;
  }
}
