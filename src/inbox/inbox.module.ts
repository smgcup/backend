import { Module } from '@nestjs/common';
import { InboxService } from './inbox.service';
import { InboxResolver } from './inbox.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../notification/entities/notification.entity';
import { NotificationType } from '../notification/entities/notification-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationType])],
  providers: [InboxService, InboxResolver],
  exports: [InboxService],
})
export class InboxModule {}
