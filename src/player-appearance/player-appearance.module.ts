import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerAppearance } from './entities/player-appearance.entity';
import { PlayerAppearanceService } from './player-appearance.service';
import { PlayerAppearanceResolver } from './player-appearance.resolver';
import { MatchModule } from '../match/match.module';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerAppearance]), MatchModule, PlayerModule],
  providers: [PlayerAppearanceService, PlayerAppearanceResolver],
  exports: [PlayerAppearanceService],
})
export class PlayerAppearanceModule {}
