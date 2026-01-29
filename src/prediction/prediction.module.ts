import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prediction } from './entities/prediction.entity';
import { UserPredictionStats } from './entities/user-prediction-stats.entity';
import { User } from '../user/entities/user.entity';
import { Match } from '../match/entities/match.entity';
import { PredictionService } from './prediction.service';
import { PredictionResolver } from './prediction.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Prediction, UserPredictionStats, User, Match])],
  providers: [PredictionService, PredictionResolver],
  exports: [PredictionService],
})
export class PredictionModule {}
