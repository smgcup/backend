import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Team } from '../team/entities/team.entity';
import { BadRequestError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { MATCH_TRANSLATION_CODES } from '../exception/translation-codes/match.translation-codes';
import { generateUuidv7 } from '../shared/utils';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { MatchStatus } from './enums/match-status.enum';

@Injectable()
export class MatchService {
  private readonly logger = new Logger(MatchService.name);

  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async getMatches(): Promise<Match[]> {
    return await this.matchRepository.find({
      relations: { firstOpponent: true, secondOpponent: true },
      order: { date: 'ASC' },
    });
  }

  async getMatchById(id: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id },
      relations: { firstOpponent: true, secondOpponent: true },
    });
    if (!match) {
      throw new NotFoundError(MATCH_TRANSLATION_CODES.matchNotFound);
    }
    return match;
  }

  async createMatch(createMatchDto: CreateMatchDto): Promise<Match> {
    this.assertValidDate(createMatchDto.date);
    await this.assertOpponentsExist(createMatchDto.firstOpponentId, createMatchDto.secondOpponentId);

    try {
      const match = this.matchRepository.create({
        id: generateUuidv7(),
        firstOpponent: { id: createMatchDto.firstOpponentId },
        secondOpponent: { id: createMatchDto.secondOpponentId },
        date: createMatchDto.date ?? null,
        status: createMatchDto.status,
        score1: null,
        score2: null,
        round: createMatchDto.round,
        location: createMatchDto.location ?? null,
      });

      const saved = await this.matchRepository.save(match);
      return await this.getMatchById(saved.id);
    } catch (error: unknown) {
      this.logger.error(`Error creating match: ${(error as Error).message}`);
      throw new InternalServerError(MATCH_TRANSLATION_CODES.matchCreationFailed);
    }
  }

  async updateMatch(id: string, updateMatchDto: UpdateMatchDto): Promise<Match> {
    const match = await this.getMatchById(id);

    if (updateMatchDto.date) {
      this.assertValidDate(updateMatchDto.date);
    }

    const nextFirstOpponentId = updateMatchDto.firstOpponentId ?? match.firstOpponent.id;
    const nextSecondOpponentId = updateMatchDto.secondOpponentId ?? match.secondOpponent.id;
    if (updateMatchDto.firstOpponentId || updateMatchDto.secondOpponentId) {
      await this.assertOpponentsExist(nextFirstOpponentId, nextSecondOpponentId);
    } else if (nextFirstOpponentId === nextSecondOpponentId) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.opponentTeamsMustBeDifferent);
    }

    const nextStatus = updateMatchDto.status ?? match.status;
    const nextScore1 = updateMatchDto.score1 ?? match.score1 ?? null;
    const nextScore2 = updateMatchDto.score2 ?? match.score2 ?? null;
    this.assertScoresAllowed(nextStatus, nextScore1, nextScore2);

    try {
      if (updateMatchDto.firstOpponentId) {
        match.firstOpponent = { id: updateMatchDto.firstOpponentId } as Team;
      }
      if (updateMatchDto.secondOpponentId) {
        match.secondOpponent = { id: updateMatchDto.secondOpponentId } as Team;
      }
      if (updateMatchDto.date) {
        match.date = updateMatchDto.date ?? null;
      }
      if (updateMatchDto.status) {
        match.status = updateMatchDto.status;
      }
      if (typeof updateMatchDto.score1 !== 'undefined') {
        match.score1 = updateMatchDto.score1;
      }
      if (typeof updateMatchDto.score2 !== 'undefined') {
        match.score2 = updateMatchDto.score2;
      }
      if (updateMatchDto.round) {
        match.round = updateMatchDto.round;
      }
      if (updateMatchDto.location !== undefined) {
        match.location = updateMatchDto.location ?? null;
      }

      await this.matchRepository.save(match);
      return await this.getMatchById(id);
    } catch {
      throw new InternalServerError(MATCH_TRANSLATION_CODES.matchUpdateFailed);
    }
  }

  async deleteMatch(id: string): Promise<Match> {
    const match = await this.getMatchById(id);
    await this.matchRepository.remove(match);
    return { ...match, id };
  }

  async startMatch(id: string): Promise<Match> {
    const match = await this.getMatchById(id);

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.matchCannotBeStarted);
    }

    try {
      match.status = MatchStatus.LIVE;
      match.score1 = 0;
      match.score2 = 0;

      await this.matchRepository.save(match);
      return await this.getMatchById(id);
    } catch {
      throw new InternalServerError(MATCH_TRANSLATION_CODES.matchUpdateFailed);
    }
  }

  private assertValidDate(date?: unknown): void {
    // allow null / undefined
    if (date == null) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const parsedDate = date instanceof Date ? date : new Date(date as any);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.invalidMatchDate);
    }
  }

  private async assertOpponentsExist(firstOpponentId: string, secondOpponentId: string): Promise<void> {
    if (firstOpponentId === secondOpponentId) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.opponentTeamsMustBeDifferent);
    }

    const [first, second] = await Promise.all([
      this.teamRepository.findOne({ where: { id: firstOpponentId } }),
      this.teamRepository.findOne({ where: { id: secondOpponentId } }),
    ]);

    if (!first || !second) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.opponentTeamNotFound);
    }
  }

  private assertScoresAllowed(nextStatus: MatchStatus, nextScore1: number | null, nextScore2: number | null): void {
    const allowed = nextStatus === MatchStatus.LIVE || nextStatus === MatchStatus.FINISHED;
    if (!allowed && (nextScore1 !== null || nextScore2 !== null)) {
      throw new BadRequestError(MATCH_TRANSLATION_CODES.scoreNotAllowedForStatus);
    }
  }
}
