import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchEvent } from './entities/match-event.entity';
import { MatchEventService } from './match-event.service';
import { MatchEventResolver } from './match-event.resolver';
import { Match } from '../match/entities/match.entity';
import { PlayerModule } from '../player/player.module';
import { TeamModule } from '../team/team.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchEvent, Match]), PlayerModule, TeamModule],
  providers: [MatchEventService, MatchEventResolver],
  exports: [MatchEventService],
})
export class MatchEventModule {}
