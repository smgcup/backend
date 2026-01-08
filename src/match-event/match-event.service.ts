import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { Match } from '../match/entities/match.entity';
import { Team } from '../team/entities/team.entity';
import { Player } from '../player/entities/player.entity';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { MATCH_EVENT_TRANSLATION_CODES } from '../exception/translation-codes';
import { MatchEventType } from './enums/match-event-type.enum';

@Injectable()
export class MatchEventService {
  constructor(
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

  async getMatchEventsByMatchId(matchId: string): Promise<MatchEvent[]> {
    return await this.matchEventRepository.find({
      where: { matchId },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        team: true,
        player: { team: true },
      },
      order: { minute: 'ASC', createdAt: 'ASC' },
    });
  }

  async createMatchEvent(createMatchEventDto: CreateMatchEventDto): Promise<MatchEvent> {
    const match = await this.matchRepository.findOne({
      where: { id: createMatchEventDto.matchId },
      relations: { firstOpponent: true, secondOpponent: true },
    });
    if (!match) {
      throw new NotFoundError(MATCH_EVENT_TRANSLATION_CODES.matchNotFound);
    }

    const team = await this.teamRepository.findOne({ where: { id: createMatchEventDto.teamId } });
    if (!team) {
      throw new NotFoundError(MATCH_EVENT_TRANSLATION_CODES.teamNotFound);
    }

    const isTeamInMatch = team.id === match.firstOpponent.id || team.id === match.secondOpponent.id;
    if (!isTeamInMatch) {
      throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.teamNotInMatch);
    }

    const isMarker =
      createMatchEventDto.type === MatchEventType.HALF_TIME || createMatchEventDto.type === MatchEventType.FULL_TIME;
    if (isMarker && createMatchEventDto.playerId) {
      throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.markerEventCannotHavePlayer);
    }

    let player: Player | null = null;
    if (createMatchEventDto.playerId) {
      player = await this.playerRepository.findOne({
        where: { id: createMatchEventDto.playerId },
        relations: { team: true },
      });
      if (!player) {
        throw new NotFoundError(MATCH_EVENT_TRANSLATION_CODES.playerNotFound);
      }
      if (player.team?.id !== team.id) {
        throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.playerNotInTeam);
      }
    }

    try {
      const created = this.matchEventRepository.create({
        matchId: match.id,
        match: { id: match.id } as Match,
        teamId: team.id,
        team: { id: team.id } as Team,
        playerId: player?.id ?? null,
        player: player ? ({ id: player.id } as Player) : null,
        type: createMatchEventDto.type,
        minute: createMatchEventDto.minute,
        payload: createMatchEventDto.payload ?? null,
      });

      const saved = await this.matchEventRepository.save(created);
      return await this.getMatchEventById(saved.id);
    } catch {
      throw new InternalServerError(MATCH_EVENT_TRANSLATION_CODES.matchEventCreationFailed);
    }
  }

  async deleteMatchEvent(id: string): Promise<MatchEvent> {
    const event = await this.getMatchEventById(id);
    await this.matchEventRepository.remove(event);
    return { ...event, id };
  }

  private async getMatchEventById(id: string): Promise<MatchEvent> {
    const event = await this.matchEventRepository.findOne({
      where: { id },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        team: true,
        player: { team: true },
      },
    });
    if (!event) {
      throw new NotFoundError(MATCH_EVENT_TRANSLATION_CODES.matchEventNotFound);
    }
    return event;
  }
}
