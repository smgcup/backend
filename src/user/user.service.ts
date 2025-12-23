import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { Team } from '../team/entities/team.entity';
import { Account } from '../account/entities/account.entity';
import { NotFoundError } from '../exception/exceptions';
import { CreateUserInput } from './dto/create-user.input';
import { TeamService } from '../team/team.service';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import {
  TEAM_TRANSLATION_CODES,
  USER_TRANSLATION_CODES,
  ACCOUNT_TRANSLATION_CODES,
} from '../exception/translation-codes';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly teamService: TeamService,
  ) {}

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with email ${email} not found`);
    }
    return user;
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async getUserTeam(userId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { users: { id: userId } },
    });
    if (!team) {
      throw new NotFoundError(TEAM_TRANSLATION_CODES.teamNotFoundForUser, `Team not found for user ${userId}`);
    }
    return team;
  }

  async getUserByAccountId(accountId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { account: { id: accountId } },
      relations: ['team'],
    });
    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User not found for account ${accountId}`);
    }
    return user;
  }
  async getUserAccount(userId: string): Promise<Account> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['account'],
    });

    if (!user) {
      throw new NotFoundError(USER_TRANSLATION_CODES.userNotFound, `User with ID ${userId} not found`);
    }

    const account = user.account;
    if (!account) {
      throw new NotFoundError(ACCOUNT_TRANSLATION_CODES.accountNotFound, `Account not found for user ${userId}`);
    }

    return account;
  }

  async createUser(
    createUserInput: Omit<CreateUserInput, 'password'>,
    account: Account,
    manager?: EntityManager,
  ): Promise<User> {
    const userRepository = manager ? manager.getRepository(User) : this.userRepository;
    const team = await this.teamService.getTeam(createUserInput.teamId);

    const newUser = userRepository.create({
      ...createUserInput,
      id: generateUuidv7(),
      team: team,
      account: account,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return await userRepository.save(newUser);
  }
}
