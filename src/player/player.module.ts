import { Module, forwardRef } from '@nestjs/common';
import { Player } from './entities/player.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerService } from './player.service';
import { TeamModule } from '../team/team.module';
import { PlayerResolver } from './player.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Player]), forwardRef(() => TeamModule)],
  providers: [PlayerService, PlayerResolver],
  exports: [PlayerService, TypeOrmModule],
})
export class PlayerModule {}
