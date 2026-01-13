import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { Player } from '../player/entities/player.entity';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { MATCH_EVENT_TRANSLATION_CODES } from '../exception/translation-codes';
import { MatchEventType } from './enums/match-event-type.enum';
import { PlayerService } from '../player/player.service';
import { TeamService } from '../team/team.service';
import { MatchService } from '../match/match.service';
import { generateUuidv7 } from '../shared/utils';

@Injectable()
export class MatchEventService {
  constructor(
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    private readonly matchService: MatchService,
    private readonly playerService: PlayerService,
    private readonly teamService: TeamService,
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
    const match = await this.matchService.getMatchById(createMatchEventDto.matchId);

    const team = await this.teamService.getTeamById(createMatchEventDto.teamId);

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
      player = await this.playerService.getPlayerById(createMatchEventDto.playerId, { relations: { team: true } });
      if (player.team?.id !== team.id) {
        throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.playerNotInTeam);
      }
    }

    const assistPlayer =
      createMatchEventDto.type === MatchEventType.GOAL && createMatchEventDto.assistPlayerId
        ? await this.playerService.getPlayerById(createMatchEventDto.assistPlayerId, {
            relations: { team: true },
          })
        : null;

    if (assistPlayer && player && assistPlayer?.team?.id !== player?.team?.id) {
      throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.playerNotInTeam);
    }

    try {
      const created = this.matchEventRepository.create({
        id: generateUuidv7(),
        match,
        team,
        player,
        assistPlayer,
        type: createMatchEventDto.type,
        minute: createMatchEventDto.minute,
        createdAt: new Date(),
      });

      return await this.matchEventRepository.save(created);
    } catch (error) {
      console.error(error);

      throw new InternalServerError(MATCH_EVENT_TRANSLATION_CODES.matchEventCreationFailed);
    }
  }

  async deleteMatchEvent(id: MatchEvent['id']) {
    const event = await this.getMatchEventById(id);
    await this.matchEventRepository.remove(event);
    return id;
  }

  private async getMatchEventById(id: MatchEvent['id']): Promise<MatchEvent> {
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
