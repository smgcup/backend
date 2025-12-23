import { Resolver, Mutation, Query, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { LoginInput } from './dto/login.input';
// import { CreateAccountInput } from './dto/register.input';
import { AuthResponse } from './dto/auth-response.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';

@Resolver(() => Account)
export class AccountResolver {
  constructor(private readonly accountService: AccountService) {}

  // @Mutation(() => AuthResponse, { name: 'register', nullable: false })
  // async register(@Args('input') input: CreateAccountInput): Promise<AuthResponse> {
  //   return await this.accountService.createAccount(input);
  // }

  @Mutation(() => AuthResponse, { name: 'login', nullable: false })
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return await this.accountService.login(input);
  }

  @Query(() => Account, { name: 'me', nullable: true })
  @UseGuards(JwtAuthGuard)
  async getCurrentAccount(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string): Promise<Account> {
    return await this.accountService.getAccountById(id);
  }
}
