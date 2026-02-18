import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { Prediction } from './entities/prediction.entity';
import { UserPredictionStats } from './entities/user-prediction-stats.entity';
import { Match } from '../match/entities/match.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { UpdatePredictionDto } from './dto/update-prediction.dto';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../admin/auth/guards/admin-auth.guard';
import { UserSession } from '../user/decorators/user-session.decorator';
import { User } from '../user/entities/user.entity';

@Resolver(() => Prediction)
export class PredictionResolver {
  constructor(private readonly predictionService: PredictionService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Prediction], { name: 'myPredictions' })
  async myPredictions(@UserSession() user: User): Promise<Prediction[]> {
    return await this.predictionService.getUserPredictions(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => Prediction, { name: 'myPredictionForMatch', nullable: true })
  async myPredictionForMatch(
    @UserSession() user: User,
    @Args('matchId', { type: () => String }) matchId: string,
  ): Promise<Prediction | null> {
    return await this.predictionService.getUserPredictionForMatch(user.id, matchId);
  }

  @Query(() => [Prediction], { name: 'predictionsByMatch' })
  async predictionsByMatch(@Args('matchId', { type: () => String }) matchId: string): Promise<Prediction[]> {
    return await this.predictionService.getPredictionsByMatch(matchId);
  }

  @Query(() => [UserPredictionStats], { name: 'predictionLeaderboard' })
  async predictionLeaderboard(): Promise<UserPredictionStats[]> {
    return await this.predictionService.getLeaderboard();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserPredictionStats, { name: 'myPredictionStats' })
  async myPredictionStats(@UserSession() user: User): Promise<UserPredictionStats> {
    return await this.predictionService.getUserPredictionStats(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Prediction, { name: 'createPrediction' })
  async createPrediction(
    @UserSession() user: User,
    @Args('input', { type: () => CreatePredictionDto }) input: CreatePredictionDto,
  ): Promise<Prediction> {
    return await this.predictionService.createPrediction(user.id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Prediction, { name: 'updatePrediction' })
  async updatePrediction(
    @UserSession() user: User,
    @Args('id', { type: () => String }) id: string,
    @Args('input', { type: () => UpdatePredictionDto }) input: UpdatePredictionDto,
  ): Promise<Prediction> {
    return await this.predictionService.updatePrediction(user.id, id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Prediction, { name: 'deletePrediction' })
  async deletePrediction(
    @UserSession() user: User,
    @Args('id', { type: () => String }) id: string,
  ): Promise<Prediction> {
    return await this.predictionService.deletePrediction(user.id, id);
  }

  // @UseGuards(AdminAuthGuard)
  @Mutation(() => Match, { name: 'calculateMatchPoints' })
  async calculateMatchPoints(@Args('matchId', { type: () => String }) matchId: string): Promise<Match> {
    return await this.predictionService.calculatePointsForMatch(matchId);
  }
}
