import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(userId: number, unreadOnly?: boolean): Promise<Notification[]> {
    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }
    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 50, // Limit to 50 recent notifications
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update({ userId, isRead: false }, { isRead: true });
  }

  async remove(id: number, userId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    await this.notificationRepository.remove(notification);
  }

  async createNotification(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createDto);
    return this.notificationRepository.save(notification);
  }

  async notifyReceptionists(
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    link?: string,
    entityType?: string,
    entityId?: number,
  ): Promise<void> {
    const receptionists = await this.userRepository.find({
      where: { role: { name: 'receptionist' } },
      relations: { role: true },
    });

    const notifications = receptionists.map((receptionist) => {
      return this.notificationRepository.create({
        userId: receptionist.id,
        title,
        titleAr,
        message,
        messageAr,
        type: 'appointment_request',
        link,
        entityType,
        entityId,
      });
    });

    if (notifications.length > 0) {
      await this.notificationRepository.save(notifications);
    }
  }
}
