import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { MatchEventService } from './match-event.service';
import { MatchEventResolver } from './match-event.resolver';
import { Match } from '../match/entities/match.entity';
import { Team } from '../team/entities/team.entity';
import { Player } from '../player/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEvent, Match, Team, Player])],
  providers: [MatchEventService, MatchEventResolver],
  exports: [MatchEventService],
})
export class MatchEventModule {}
