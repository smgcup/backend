import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    // Validate scores are non-negative (handled by DTO validation, but double-check)
    if (createDto.predictedScore1 < 0 || createDto.predictedScore2 < 0) {
      throw new BadRequestError(PREDICTION_TRANSLATION_CODES.invalidPredictionScores);
    }

    try {
      const prediction = this.predictionRepository.create({
        id: generateUuidv7(),
        userId,
        matchId: createDto.matchId,
        predictedScore1: createDto.predictedScore1,
        predictedScore2: createDto.predictedScore2,
        pointsEarned: null,
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

    try {
      if (typeof updateDto.predictedScore1 !== 'undefined') {
        prediction.predictedScore1 = updateDto.predictedScore1;
      }
      if (typeof updateDto.predictedScore2 !== 'undefined') {
        prediction.predictedScore2 = updateDto.predictedScore2;
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

  // TODO: Implement point calculation
  // This should be called when a match ends (status = FINISHED)
  // 1. Get the match and verify it's FINISHED (not CANCELLED)
  // 2. Get all predictions for this match where pointsEarned is null
  // 3. For each prediction:
  //    - Compare predictedScore1/predictedScore2 with actual match.score1/score2
  //    - If exact match (predictedScore1 === score1 && predictedScore2 === score2): pointsEarned = 10
  //    - Else if correct outcome (win/draw/loss matches): pointsEarned = 5
  //      - Helper: getMatchOutcome(score1, score2) returns 'WIN', 'DRAW', or 'LOSS' for first team
  //      - Compare predicted outcome with actual outcome
  //    - Else: pointsEarned = 0
  // 4. Update UserPredictionStats for each user:
  //    - Add pointsEarned to totalPoints
  //    - Increment exactMatchesCount if pointsEarned === 10
  //    - Increment correctOutcomesCount if pointsEarned === 5
  // 5. Save all updated predictions and stats
  async calculatePointsForMatch(matchId: string): Promise<void> {
    // TODO: Implement this method
  }
}
