import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Athlete } from '../athlete/entities/athlete.entity';
import { NotFoundError } from '../exception/exceptions';
import { TEAM_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
  ) {}

  async getTeam(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
    });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFound, `Team with ID ${id} not found`);
    }
    return team;
  }

  async getTeamUsers(teamId: string) {
    return await this.userRepository.find({
      where: { team: { id: teamId } },
    });
  }

  async getTeamAthletes(teamId: string) {
    return await this.athleteRepository.find({
      where: { team: { id: teamId } },
    });
  }

  async getAllTeams(): Promise<Team[]> {
    return await this.teamRepository.find();
  }
}
