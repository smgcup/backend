import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { ConflictError, NotFoundError } from '../exception/exceptions';
import { TEAM_TRANSLATION_CODES } from '../exception/translation-codes';
import { CreateTeamDto } from './dto/create-team.dto';
import { generateUuidv7 } from '../shared/utils';
import { InternalServerError } from '../exception/exceptions';
import { Player } from '../player/entities/player.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Player)
    private playerRepository: Repository<Player>,
  ) {}

  /**
   * Method to get a team by its ID
   * @param id - The ID of the team to get
   * @returns The team with the given ID
   */
  async getTeamById(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFound);
    }
    return team;
  }

  /**
   * Method to create a new team
   * @param createTeamDto - The data for the new team
   * @returns The newly created team
   */
  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const existingTeam = await this.teamRepository.findOne({ where: { name: createTeamDto.name } });
    if (existingTeam) {
      throw new ConflictError(TEAM_TRANSLATION_CODES.teamNameAlreadyExists);
    }
    try {
      const team = this.teamRepository.create({
        id: generateUuidv7(),
        name: createTeamDto.name,
      });

      await this.teamRepository.save(team);

      return team;
    } catch {
      throw new InternalServerError(TEAM_TRANSLATION_CODES.teamCreationFailed);
    }
  }
}
