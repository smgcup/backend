import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from './entities/notification-type.entity';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { TriggeredAcuteSymptom } from '../triggered-acute-symptom/entities/triggered-acute-symptom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationType, TriggeredAcuteSymptom])],
  providers: [NotificationService, NotificationResolver],
  exports: [NotificationService],
})
export class NotificationModule {}
