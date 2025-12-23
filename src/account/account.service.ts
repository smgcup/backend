import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConflictError } from '../exception/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Account } from './entities/account.entity';
import { LoginInput } from './dto/login.input';
import { CreateAccountInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response.type';
import { JwtPayload } from './strategies/jwt.strategy';
import { NotFoundError } from '../exception/exceptions';
import { ACCOUNT_TRANSLATION_CODES } from '../exception/translation-codes';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { AccountRole } from './enums/role.enum';
@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private jwtService: JwtService,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
    role: AccountRole,
    manager?: EntityManager,
  ): Promise<AuthResponse> {
    const accountRepository = manager ? manager.getRepository(Account) : this.accountRepository;

    // Check if account already exists
    const existingAccount = await accountRepository.findOne({
      where: { email: createAccountInput.email },
    });

    if (existingAccount) {
      throw new ConflictError(
        ACCOUNT_TRANSLATION_CODES.accountEmailAlreadyInUse,
        `Account with email ${createAccountInput.email} already exists`,
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createAccountInput.password, 10);

    // Create account
    const account = accountRepository.create({
      id: generateUuidv7(),
      email: createAccountInput.email,
      password: hashedPassword,
      role: role,
    });

    const savedAccount = await accountRepository.save(account);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: savedAccount.id,
      email: savedAccount.email,
      role: savedAccount.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      account: savedAccount,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    // Find account by email
    const account = await this.accountRepository.findOne({
      where: { email: input.email },
    });

    if (!account) {
      throw new UnauthorizedException(ACCOUNT_TRANSLATION_CODES.accountPasswordInvalid, 'Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(input.password, account.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(ACCOUNT_TRANSLATION_CODES.accountPasswordInvalid, 'Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: account.id,
      email: account.email,
      role: account.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      account,
    };
  }

  async getAccountById(id: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { id },
      relations: ['team'],
    });

    if (!account) {
      throw new NotFoundError(ACCOUNT_TRANSLATION_CODES.accountNotFound, `Account with ID ${id} not found`);
    }

    return account;
  }

  async getAccountByEmail(email: string): Promise<Account | null> {
    return await this.accountRepository.findOne({
      where: { email },
    });
  }
}
