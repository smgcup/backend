import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String, { name: 'health' })
  health(): string {
    return 'The server is successfully running!';
  }
}
