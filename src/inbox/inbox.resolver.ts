import { Resolver } from '@nestjs/graphql';
import { InboxService } from './inbox.service';

@Resolver()
export class InboxResolver {
  constructor(private readonly inboxService: InboxService) {}
}
