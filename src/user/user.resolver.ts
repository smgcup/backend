import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { AuthResponse } from './dto/auth-response.type';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from './dto/register.input';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => AuthResponse, { name: 'login', nullable: false })
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return await this.userService.login(loginInput);
  }

  @Mutation(() => AuthResponse, { name: 'createUser', nullable: false })
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<AuthResponse> {
    return await this.userService.createUser(createUserInput);
  }
}
