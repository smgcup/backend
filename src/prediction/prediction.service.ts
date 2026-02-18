import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Prediction } from './entities/prediction.entity';
import { UserPredictionStats } from './entities/user-prediction-stats.entity';
import { Match } from '../match/entities/match.entity';
import { User } from '../user/entities/user.entity';
import { BadRequestError, ConflictError, InternalServerError, NotFoundError } from '../exception/exceptions';
import { PREDICTION_TRANSLATION_CODES } from '../exception/translation-codes/prediction.translation-codes';
import { MATCH_TRANSLATION_CODES } from '../exception/translation-codes/match.translation-codes';
import { generateUuidv7 } from '../shared/utils';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { MatchStatus } from '../match/enums/match-status.enum';
import { PREDICTION_POINTS } from './prediction.constants';
import { MatchTopPredictions } from './dto/top-match-predictions.output';

@Injectable()
export class PredictionService {
  private readonly logger = new Logger(PredictionService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepository: Repository<Prediction>,
    @InjectRepository(UserPredictionStats)
    private readonly statsRepository: Repository<UserPredictionStats>,
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createPrediction(userId: string, createDto: CreatePredictionDto): Promise<Prediction> {
    // Check match exists and status is SCHEDULED
    const match = await this.matchRepository.findOne({
      where: { id: createDto.matchId },
    });

    if (!match) {
      throw new NotFoundError(MATCH_TRANSLATION_CODES.matchNotFound);
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.matchNotScheduled);
    }

    // Check user hasn't already predicted this match
    const existingPrediction = await this.predictionRepository.findOne({
      where: { userId, matchId: createDto.matchId },
    });

    if (existingPrediction) {
      throw new ConflictError(PREDICTION_TRANSLATION_CODES.predictionAlreadyExists);
    }

    if (createDto.isBoosted) {
      await this.ensureSingleBoosterPerRound(userId, match.round);
    }

    try {
      const prediction = this.predictionRepository.create({
        id: generateUuidv7(),
        userId,
        matchId: createDto.matchId,
        predictedScore1: createDto.predictedScore1,
        predictedScore2: createDto.predictedScore2,
        pointsEarned: null,
        isBoosted: createDto.isBoosted ?? false,
      });

      const saved = await this.predictionRepository.save(prediction);

      // Create or update UserPredictionStats.totalPredictionsCount
      await this.incrementTotalPredictionsCount(userId);

      return await this.getPredictionById(saved.id);
    } catch (error: unknown) {
      this.logger.error(`Error creating prediction: ${(error as Error).message}`);
      throw new InternalServerError(PREDICTION_TRANSLATION_CODES.predictionCreationFailed);
    }
  }

  async updatePrediction(userId: string, predictionId: string, updateDto: UpdatePredictionDto): Promise<Prediction> {
    const prediction = await this.getPredictionById(predictionId);

    // Validate user owns the prediction
    if (prediction.userId !== userId) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.predictionNotFound);
    }

    // Check match status is still SCHEDULED
    const match = await this.matchRepository.findOne({
      where: { id: prediction.matchId },
    });

    if (!match) {
      throw new NotFoundError(MATCH_TRANSLATION_CODES.matchNotFound);
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.matchAlreadyStarted);
    }

    if (updateDto.isBoosted) {
      await this.ensureSingleBoosterPerRound(userId, match.round, predictionId);
    }

    try {
      if (typeof updateDto.predictedScore1 !== 'undefined') {
        prediction.predictedScore1 = updateDto.predictedScore1;
      }
      if (typeof updateDto.predictedScore2 !== 'undefined') {
        prediction.predictedScore2 = updateDto.predictedScore2;
      }
      if (typeof updateDto.isBoosted !== 'undefined') {
        prediction.isBoosted = updateDto.isBoosted;
      }

      await this.predictionRepository.save(prediction);
      return await this.getPredictionById(predictionId);
    } catch (error: unknown) {
      this.logger.error(`Error updating prediction: ${(error as Error).message}`);
      throw new InternalServerError(PREDICTION_TRANSLATION_CODES.predictionUpdateFailed);
    }
  }

  async deletePrediction(userId: string, predictionId: string): Promise<Prediction> {
    const prediction = await this.getPredictionById(predictionId);

    // Validate user owns the prediction
    if (prediction.userId !== userId) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.predictionNotFound);
    }

    // Check match status is still SCHEDULED
    const match = await this.matchRepository.findOne({
      where: { id: prediction.matchId },
    });

    if (!match) {
      throw new NotFoundError(MATCH_TRANSLATION_CODES.matchNotFound);
    }

    if (match.status !== MatchStatus.SCHEDULED) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.matchAlreadyStarted);
    }

    await this.predictionRepository.remove(prediction);
    return { ...prediction, id: predictionId };
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { userId },
      relations: { match: { firstOpponent: true, secondOpponent: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async getPredictionsByMatch(matchId: string): Promise<Prediction[]> {
    return await this.predictionRepository.find({
      where: { matchId },
      relations: { user: true, match: { firstOpponent: true, secondOpponent: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserPredictionForMatch(userId: string, matchId: string): Promise<Prediction | null> {
    return await this.predictionRepository.findOne({
      where: { userId, matchId },
      relations: { match: { firstOpponent: true, secondOpponent: true } },
    });
  }

  async getUserPredictionStats(userId: string): Promise<UserPredictionStats> {
    let stats = await this.statsRepository.findOne({
      where: { userId },
      relations: { user: true },
    });

    if (!stats) {
      // Create stats if they don't exist
      stats = this.statsRepository.create({
        id: generateUuidv7(),
        userId,
        totalPoints: 0,
        exactMatchesCount: 0,
        correctOutcomesCount: 0,
        totalPredictionsCount: 0,
        lastUpdated: new Date(),
      });
      stats = await this.statsRepository.save(stats);
    }

    return stats;
  }

  async getLeaderboard(): Promise<UserPredictionStats[]> {
    return await this.statsRepository.find({
      relations: { user: true },
      order: { totalPoints: 'DESC', lastUpdated: 'ASC' },
    });
  }

  async getPredictionById(id: string): Promise<Prediction> {
    const prediction = await this.predictionRepository.findOne({
      where: { id },
      relations: { user: true, match: { firstOpponent: true, secondOpponent: true } },
    });

    if (!prediction) {
      throw new NotFoundError(PREDICTION_TRANSLATION_CODES.predictionNotFound);
    }

    return prediction;
  }

  private async ensureSingleBoosterPerRound(
    userId: string,
    round: number,
    excludePredictionId?: string,
  ): Promise<void> {
    const query = this.predictionRepository
      .createQueryBuilder('prediction')
      .innerJoin('prediction.match', 'match')
      .where('prediction.userId = :userId', { userId })
      .andWhere('prediction.isBoosted = true')
      .andWhere('match.round = :round', { round });

    if (excludePredictionId) {
      query.andWhere('prediction.id != :excludePredictionId', { excludePredictionId });
    }

    const existingBoosted = await query.getOne();

    if (existingBoosted) {
      existingBoosted.isBoosted = false;
      await this.predictionRepository.save(existingBoosted);
    }
  }

  private async incrementTotalPredictionsCount(userId: string): Promise<void> {
    let stats = await this.statsRepository.findOne({
      where: { userId },
    });

    if (!stats) {
      stats = this.statsRepository.create({
        id: generateUuidv7(),
        userId,
        totalPoints: 0,
        exactMatchesCount: 0,
        correctOutcomesCount: 0,
        totalPredictionsCount: 0,
        lastUpdated: new Date(),
      });
    }

    stats.totalPredictionsCount += 1;
    stats.lastUpdated = new Date();
    await this.statsRepository.save(stats);
  }

  async calculatePointsForMatch(matchId: string): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: { firstOpponent: true, secondOpponent: true },
    });

    if (!match) {
      throw new NotFoundError(MATCH_TRANSLATION_CODES.matchNotFound);
    }

    if (match.status !== MatchStatus.FINISHED) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.matchNotFinished);
    }

    if (match.pointsCalculated) {
      throw new ConflictError(PREDICTION_TRANSLATION_CODES.pointsAlreadyCalculated);
    }

    const predictions = await this.predictionRepository.find({
      where: { matchId },
    });

    try {
      return await this.dataSource.transaction(async (manager) => {
        const statsMap = new Map<string, UserPredictionStats>();

        for (const prediction of predictions) {
          const basePoints = this.calculateBasePoints(
            prediction.predictedScore1,
            prediction.predictedScore2,
            match.score1!,
            match.score2!,
          );

          prediction.pointsEarned = prediction.isBoosted
            ? basePoints * PREDICTION_POINTS.BOOSTER_MULTIPLIER
            : basePoints;
          await manager.save(prediction);

          // Update user prediction stats
          let stats = statsMap.get(prediction.userId);
          if (!stats) {
            stats = (await manager.findOne(UserPredictionStats, { where: { userId: prediction.userId } })) ?? undefined;
            if (!stats) {
              stats = manager.create(UserPredictionStats, {
                id: generateUuidv7(),
                userId: prediction.userId,
                totalPoints: 0,
                exactMatchesCount: 0,
                correctOutcomesCount: 0,
                totalPredictionsCount: 0,
                lastUpdated: new Date(),
              });
            }
            statsMap.set(prediction.userId, stats);
          }

          stats.totalPoints += prediction.pointsEarned;
          if (basePoints === PREDICTION_POINTS.EXACT_SCORE) {
            stats.exactMatchesCount += 1;
          } else if (basePoints === PREDICTION_POINTS.CORRECT_OUTCOME) {
            stats.correctOutcomesCount += 1;
          }
        }

        // Save all updated stats
        for (const stats of statsMap.values()) {
          stats.lastUpdated = new Date();
          await manager.save(stats);
        }

        // TODO: Calculate fantasy points for players here

        // TODO: Update player stats table here

        match.pointsCalculated = true;
        await manager.save(match);

        return match;
      });
    } catch (error) {
      if (error instanceof BadRequestError || error instanceof ConflictError || error instanceof NotFoundError) {
        throw error;
      }
      this.logger.error(`Error calculating points for match: ${(error as Error).message}`);
      throw new InternalServerError(PREDICTION_TRANSLATION_CODES.pointsCalculationFailed);
    }
  }

  private getOutcome(score1: number, score2: number): 'WIN' | 'DRAW' | 'LOSS' {
    if (score1 > score2) return 'WIN';
    if (score1 < score2) return 'LOSS';
    return 'DRAW';
  }

  private calculateBasePoints(
    predictedScore1: number,
    predictedScore2: number,
    actualScore1: number,
    actualScore2: number,
  ): number {
    if (predictedScore1 === actualScore1 && predictedScore2 === actualScore2) {
      return PREDICTION_POINTS.EXACT_SCORE;
    }
    if (this.getOutcome(predictedScore1, predictedScore2) === this.getOutcome(actualScore1, actualScore2)) {
      return PREDICTION_POINTS.CORRECT_OUTCOME;
    }
    return PREDICTION_POINTS.INCORRECT;
  }

  async getTopPredictionsByRound(round: number): Promise<MatchTopPredictions[]> {
    const scheduledMatches = await this.matchRepository.find({
      where: { round, status: MatchStatus.SCHEDULED },
      select: ['id'],
    });

    if (scheduledMatches.length === 0) {
      return [];
    }

    const matchIds = scheduledMatches.map((m) => m.id);

    type PredictionCountRow = {
      matchId: string;
      predictedScore1: string;
      predictedScore2: string;
      cnt: string;
      percentage: string;
    };

    const rawResults: PredictionCountRow[] = await this.predictionRepository
      .createQueryBuilder('p')
      .select('p.matchId', 'matchId')
      .addSelect('p.predictedScore1', 'predictedScore1')
      .addSelect('p.predictedScore2', 'predictedScore2')
      .addSelect('COUNT(*)', 'cnt')
      .addSelect('COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY p.matchId)', 'percentage')
      .where('p.matchId IN (:...matchIds)', { matchIds })
      .groupBy('p.matchId')
      .addGroupBy('p.predictedScore1')
      .addGroupBy('p.predictedScore2')
      .orderBy('p.matchId')
      .addOrderBy('cnt', 'DESC')
      .getRawMany();

    const matchMap = new Map<string, MatchTopPredictions>();
    for (const id of matchIds) {
      matchMap.set(id, { matchId: id, topPredictions: [] });
    }

    for (const row of rawResults) {
      const entry = matchMap.get(row.matchId)!;
      if (entry.topPredictions.length < 3) {
        entry.topPredictions.push({
          predictedScore1: parseInt(row.predictedScore1, 10),
          predictedScore2: parseInt(row.predictedScore2, 10),
          percentage: parseFloat(parseFloat(row.percentage).toFixed(1)),
        });
      }
    }

    return Array.from(matchMap.values());
  }
}
