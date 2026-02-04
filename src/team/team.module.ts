import { Module, forwardRef } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamResolver } from './team.resolver';
import { Team } from './entities/team.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerModule } from '../player/player.module';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { TeamStatsService } from './team.stats.service';
import { Match } from '../match/entities/match.entity';
import { MatchModule } from '../match/match.module';
import { MatchEventModule } from '../match-event/match-event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Team, MatchEvent, Match]),
    forwardRef(() => PlayerModule),
    forwardRef(() => MatchModule),
    forwardRef(() => MatchEventModule),
  ],
  providers: [TeamService, TeamResolver, TeamStatsService],
  exports: [TeamService],
})
export class TeamModule {}
