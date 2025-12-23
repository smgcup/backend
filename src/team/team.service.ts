import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { NotFoundError } from '../exception/exceptions';
import { TEAM_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFound);
    }
    return team;
  }
}
