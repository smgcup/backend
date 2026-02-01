import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../team/entities/team.entity';
import { Match } from '../match/entities/match.entity';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { Player } from '../player/entities/player.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsResolver } from './statistics.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Match, MatchEvent, Player])],
  providers: [StatisticsService, StatisticsResolver],
})
export class StatisticsModule {}
