import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { AuthResponse } from './dto/auth-response.type';
import { LoginInput } from './dto/login.input';
import { RegisterUserInput } from './dto/create-user.input';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UserSession } from './decorators/user-session.decorator';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => AuthResponse, { name: 'login', nullable: false })
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return await this.userService.login(loginInput);
  }

  @Mutation(() => AuthResponse, { name: 'register', nullable: false })
  async register(@Args('registerInput') registerInput: RegisterUserInput): Promise<AuthResponse> {
    return await this.userService.createUser(registerInput);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'user', nullable: false })
  user(@UserSession() user: User): User {
    return user;
  }
}
