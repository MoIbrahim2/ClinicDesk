import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsReminderService } from './notifications-reminder.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User, Appointment]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsReminderService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
