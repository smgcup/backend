import { Module } from '@nestjs/common';
import { TeamRegistrationLinkService } from './team-registration-link.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamRegistrationLink } from './entities/team-registration-link.entity';
import { Team } from '../team/entities/team.entity';
import { TeamRegistrationLinkResolver } from './team-registration-link.resolver';
import { TerraModule } from '../terra/terra.module';
import { Athlete } from '../athlete/entities/athlete.entity';
import { AthleteModule } from '../athlete/athlete.module';
@Module({
  imports: [TypeOrmModule.forFeature([TeamRegistrationLink, Team, Athlete]), TerraModule, AthleteModule],
  providers: [TeamRegistrationLinkService, TeamRegistrationLinkResolver],
  exports: [TeamRegistrationLinkService],
})
export class TeamRegistrationLinkModule {}
