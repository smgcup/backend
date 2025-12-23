import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { TriggeredAcuteSymptom } from '../triggered-acute-symptom/entities/triggered-acute-symptom.entity';
import { Repository } from 'typeorm';
import { generateUuidv7 } from '../shared/utils/generateUuidV7';
import { NotificationType } from './entities/notification-type.entity';
import { BadRequestError, NotFoundError } from '../exception';
import { NOTIFICATION_TRANSLATION_CODES } from '../exception/translation-codes';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(TriggeredAcuteSymptom)
    private triggeredAcuteSymptomRepository: Repository<TriggeredAcuteSymptom>,
    @InjectRepository(NotificationType)
    private notificationTypeRepository: Repository<NotificationType>,
  ) {}

  /**
   * Gets a notification by its ID
   * @param id - The ID of the notification to get
   * @returns The notification with the given ID
   */
  async getNotification(id: string): Promise<Notification | null> {
    return await this.notificationRepository.findOne({
      where: { id },
      relations: ['type'],
    });
  }

  /**
   * Gets all notifications
   * @returns All notifications
   */
  async getNotifications(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      relations: ['type'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Gets the acute symptoms for a notification
   * @param notificationId - The ID of the notification to get the acute symptoms for
   * @returns The acute symptoms for the notification
   */
  async getNotificationAcuteSymptoms(notificationId: string): Promise<TriggeredAcuteSymptom[]> {
    return await this.triggeredAcuteSymptomRepository.find({
      where: { notificationId },
      relations: ['symptom', 'athlete'],
    });
  }

  /**
   * Creates a notification
   * @param notification - The notification to create
   * @returns The created notification
   */
  async createNotification(
    notification: Omit<Notification, 'id' | 'createdAt' | 'count' | 'resolved'>,
  ): Promise<Notification> {
    return await this.notificationRepository.save({
      id: generateUuidv7(),
      ...notification,
      createdAt: new Date(),
      resolved: false, // not resolved by default
    });
  }
  async getNotificationType(key: string) {
    const notificationType = await this.notificationTypeRepository.findOne({
      where: { key },
    });
    if (!notificationType) {
      throw new NotFoundError(NOTIFICATION_TRANSLATION_CODES.notificationTypeNotFound);
    }
    return notificationType;
  }

  async resolveNotification(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundError(NOTIFICATION_TRANSLATION_CODES.notificationNotFound);
    }
    if (notification.resolved) {
      throw new BadRequestError(NOTIFICATION_TRANSLATION_CODES.notificationAlreadyResolved);
    }
    notification.resolved = true;
    return await this.notificationRepository.save(notification);
  }
}
