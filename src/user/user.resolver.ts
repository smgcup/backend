import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Team } from '../team/entities/team.entity';
import { Account } from '../account/entities/account.entity';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'user', nullable: true })
  async getUser(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string) {
    return await this.userService.getUser(id);
  }

  @Query(() => [User], { name: 'users', nullable: true })
  async getUsers() {
    return await this.userService.getUsers();
  }

  @ResolveField(() => Team, { nullable: false })
  async team(@Parent() user: User): Promise<Team> {
    //? This will only be called if 'team' field is requested in the GraphQL query
    return await this.userService.getUserTeam(user.id);
  }

  @ResolveField(() => Account, { nullable: false })
  async account(@Parent() user: User): Promise<Account> {
    //? This will only be called if 'account' field is requested in the GraphQL query
    return await this.userService.getUserAccount(user.id);
  }
}
