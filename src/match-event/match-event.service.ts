import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { CreateMatchEventDto } from './dto/create-match-event.dto';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { MATCH_EVENT_TRANSLATION_CODES } from '../exception/translation-codes';
import { MatchEventType } from './enums/match-event-type.enum';
import { PlayerService } from '../player/player.service';
import { PlayerStatsService } from '../player/player-stats.service';
import { TeamService } from '../team/team.service';
import { MatchService } from '../match/match.service';
import { generateUuidv7 } from '../shared/utils';
import { Match } from '../match/entities/match.entity';
import { MatchStatus } from '../match/enums/match-status.enum';

@Injectable()
export class MatchEventService {
  constructor(
    @InjectRepository(MatchEvent)
    private readonly matchEventRepository: Repository<MatchEvent>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    private readonly dataSource: DataSource,
    private readonly matchService: MatchService,
    private readonly playerService: PlayerService,
    private readonly playerStatsService: PlayerStatsService,
    private readonly teamService: TeamService,
  ) {}

  async getMatchEventsByMatchId(matchId: string) {
    return await this.matchEventRepository.find({
      where: { matchId },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        player: { team: true },
        assistPlayer: { team: true },
      },
      order: { minute: 'ASC', createdAt: 'ASC' },
    });
  }

  async createMatchEvent(createMatchEventDto: CreateMatchEventDto) {
    const match = await this.matchService.getMatchById(createMatchEventDto.matchId);

    const isMarker =
      createMatchEventDto.type === MatchEventType.HALF_TIME || createMatchEventDto.type === MatchEventType.FULL_TIME;
    if (isMarker && createMatchEventDto.playerId) {
      throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.markerEventCannotHavePlayer);
    }

    const player = createMatchEventDto.playerId
      ? await this.playerService.getPlayerById(createMatchEventDto.playerId, { relations: { team: true } })
      : null;

    if (player) {
      const isPlayerInMatch = player.team.id === match.firstOpponent.id || player.team.id === match.secondOpponent.id;
      if (!isPlayerInMatch) {
        throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.playerNotInMatch);
      }
    }

    if (createMatchEventDto.type === MatchEventType.OWN_GOAL && createMatchEventDto.assistPlayerId) {
      throw new BadRequestError(MATCH_EVENT_TRANSLATION_CODES.ownGoalCannotHaveAssist);
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
      return await this.dataSource.transaction(async (manager) => {
        const created = manager.create(MatchEvent, {
          id: generateUuidv7(),
          match,
          player,
          assistPlayer,
          type: createMatchEventDto.type,
          minute: createMatchEventDto.minute,
          createdAt: new Date(),
        });

        const savedEvent = await manager.save(created);

        // Sync player stats
        await this.playerStatsService.handleEventCreated(savedEvent, manager);

        // Update match score for goal events
        const scoringEvents = [MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_SCORED];
        if (scoringEvents.includes(createMatchEventDto.type) && player) {
          const isFirstTeam = player.team.id === match.firstOpponent.id;
          const isOwnGoal = createMatchEventDto.type === MatchEventType.OWN_GOAL;

          // Own goal counts for the opposing team
          if (isFirstTeam !== isOwnGoal) {
            match.score1 = (match.score1 ?? 0) + 1;
          } else {
            match.score2 = (match.score2 ?? 0) + 1;
          }
          await manager.save(match);
        }

        // If the event is FULL_TIME, update match status to FINISHED
        if (createMatchEventDto.type === MatchEventType.FULL_TIME) {
          match.status = MatchStatus.FINISHED;
          await manager.save(match);
        }

        return savedEvent;
      });
    } catch (error) {
      console.error(error);

      throw new InternalServerError(MATCH_EVENT_TRANSLATION_CODES.matchEventCreationFailed);
    }
  }

  async deleteMatchEvent(id: MatchEvent['id']) {
    const event = await this.getMatchEventById(id);

    return await this.dataSource.transaction(async (manager) => {
      // Sync player stats before deletion
      await this.playerStatsService.handleEventDeleted(event, manager);

      // Decrement match score for goal events
      const scoringEvents = [MatchEventType.GOAL, MatchEventType.OWN_GOAL, MatchEventType.PENALTY_SCORED];
      if (scoringEvents.includes(event.type) && event.player) {
        const match = event.match;
        const isFirstTeam = event.player.team.id === match.firstOpponent.id;
        const isOwnGoal = event.type === MatchEventType.OWN_GOAL;

        // Own goal counts for the opposing team
        if (isFirstTeam !== isOwnGoal) {
          match.score1 = Math.max((match.score1 ?? 0) - 1, 0);
        } else {
          match.score2 = Math.max((match.score2 ?? 0) - 1, 0);
        }
        await manager.save(match);
      }

      await manager.remove(event);
      return id;
    });
  }

  private async getMatchEventById(id: MatchEvent['id']) {
    const event = await this.matchEventRepository.findOne({
      where: { id },
      relations: {
        match: { firstOpponent: true, secondOpponent: true },
        player: { team: true },
        assistPlayer: { team: true },
      },
    });
    if (!event) {
      throw new NotFoundError(MATCH_EVENT_TRANSLATION_CODES.matchEventNotFound);
    }
    return event;
  }
}
