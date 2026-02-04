import { Module, forwardRef } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { Stats } from '../statistics/entities/stats.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './player.service';
import { PlayerStatsService } from './player-stats.service';
import { TeamModule } from '../team/team.module';
import { PlayerResolver } from './player.resolver';
import { ImageModule } from '../image/image.module';
import { ImageService } from '../image/image.service';
import { MatchEvent } from '../match-event/entities/match-event.entity';
import { PlayerAppearance } from '../player-appearance/entities/player-appearance.entity';
import { Match } from '../match/entities/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Stats, MatchEvent, PlayerAppearance, Match]),
    forwardRef(() => TeamModule),
    forwardRef(() => ImageModule),
  ],
  providers: [PlayerService, PlayerStatsService, PlayerResolver, ImageService],
  exports: [PlayerService, PlayerStatsService, TypeOrmModule],
})
export class PlayerModule {}
