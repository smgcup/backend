import { Resolver, Query, Args, ID, ResolveField, Parent, Mutation } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { TriggeredAcuteSymptom } from '../triggered-acute-symptom/entities/triggered-acute-symptom.entity';
import { UUIDValidationPipe } from '../shared/pipes/uuid-validation.pipe';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => Notification, { name: 'notification', nullable: true })
  async getNotification(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string): Promise<Notification | null> {
    return await this.notificationService.getNotification(id);
  }

  @Query(() => [Notification], { name: 'notifications' })
  async getNotifications(): Promise<Notification[]> {
    return await this.notificationService.getNotifications();
  }

  @ResolveField(() => [TriggeredAcuteSymptom], { nullable: true })
  async acuteSymptoms(@Parent() notification: Notification): Promise<TriggeredAcuteSymptom[] | null> {
    //? This will only be called if 'acuteSymptoms' field is requested in the GraphQL query
    //? Returns empty array if this notification doesn't have acute symptoms
    //? You can add similar ResolveFields for other entity types (e.g., otherEntities, etc.)
    return await this.notificationService.getNotificationAcuteSymptoms(notification.id);
  }

  @ResolveField(() => Number, { nullable: true })
  count(@Parent() notification: Notification): string {
    return 'NTF-' + notification.count;
  }

  @Mutation(() => Notification, { name: 'resolveNotification', nullable: false })
  async resolveNotification(@Args('id', { type: () => ID }, UUIDValidationPipe) id: string): Promise<Notification> {
    return await this.notificationService.resolveNotification(id);
  }
}
