import { Resolver } from '@nestjs/graphql';
import { MatchService } from './match.service';

@Resolver()
export class MatchResolver {
  constructor(private readonly matchService: MatchService) {}
}
