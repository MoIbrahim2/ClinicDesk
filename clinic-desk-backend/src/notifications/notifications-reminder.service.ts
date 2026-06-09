import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsReminderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsReminderService.name);
  private reminderInterval: NodeJS.Timeout;

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Notifications Reminder Service...');
    
    // Run checks initially 5 seconds after startup
    setTimeout(() => {
      this.checkReminders().catch((err) =>
        this.logger.error('Error in initial checkReminders run', err),
      );
    }, 5000);

    // Set up interval to check every 15 minutes
    this.reminderInterval = setInterval(() => {
      this.checkReminders().catch((err) =>
        this.logger.error('Error in checkReminders interval run', err),
      );
    }, 15 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.logger.log('Cleared reminder interval.');
    }
  }

  async checkReminders(): Promise<void> {
    this.logger.log('Checking appointments for upcoming reminders...');
    
    const appointments = await this.appointmentRepository.find({
      where: [
        { status: AppointmentStatus.SCHEDULED },
        { status: AppointmentStatus.CONFIRMED },
      ],
      relations: {
        patient: {
          user: true,
        },
        doctor: true,
      },
    });

    this.logger.log(`Found ${appointments.length} active scheduled/confirmed appointments.`);

    for (const appt of appointments) {
      // Ensure patient is associated with a user account
      const patientUserId = appt.patient?.userId;
      if (!patientUserId) {
        continue;
      }

      // Parse appointment date & time
      // appt.date is 'YYYY-MM-DD', appt.startTime is 'HH:MM:SS' or 'HH:MM'
      const [year, month, day] = appt.date.split('-').map(Number);
      const [hours, minutes] = appt.startTime.split(':').map(Number);
      const apptTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const diffMs = apptTime.getTime() - Date.now();

      const doctorName = `${appt.doctor.firstName} ${appt.doctor.lastName}`;
      const doctorNameAr = appt.doctor.firstNameAr && appt.doctor.lastNameAr
        ? `${appt.doctor.firstNameAr} ${appt.doctor.lastNameAr}`
        : doctorName;

      const timeStr = appt.startTime.substring(0, 5);

      // Check 24h Reminder (between 1 hour and 24 hours away)
      if (diffMs > 1 * 60 * 60 * 1000 && diffMs <= 24 * 60 * 60 * 1000) {
        await this.sendReminderIfNeeded(
          appt.id,
          patientUserId,
          'reminder_24h',
          'Appointment Reminder (24 Hours)',
          'تذكير بالموعد (قبل ٢٤ ساعة)',
          `Reminder: You have an appointment with Dr. ${doctorName} tomorrow at ${timeStr}.`,
          `تذكير: لديك موعد مع د. ${doctorNameAr} غداً الساعة ${timeStr}.`,
        );
      }

      // Check 1h Reminder (between 0 and 1 hour away)
      if (diffMs > 0 && diffMs <= 1 * 60 * 60 * 1000) {
        await this.sendReminderIfNeeded(
          appt.id,
          patientUserId,
          'reminder_1h',
          'Appointment Reminder (1 Hour)',
          'تذكير بالموعد (قبل ساعة)',
          `Reminder: Your appointment with Dr. ${doctorName} is in 1 hour at ${timeStr}.`,
          `تذكير: موعدك مع د. ${doctorNameAr} بعد ساعة في الساعة ${timeStr}.`,
        );
      }
    }
  }

  private async sendReminderIfNeeded(
    appointmentId: number,
    userId: number,
    type: 'reminder_24h' | 'reminder_1h',
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
  ): Promise<void> {
    // Check if notification already exists for this appointment & type
    const existing = await this.notificationRepository.findOne({
      where: {
        userId,
        type,
        entityType: 'appointment',
        entityId: appointmentId,
      },
    });

    if (existing) {
      return; // Reminder already sent
    }

    this.logger.log(`Sending ${type} to User ID ${userId} for Appointment ID ${appointmentId}`);

    const notification = this.notificationRepository.create({
      userId,
      title,
      titleAr,
      message,
      messageAr,
      type,
      link: '/appointments',
      entityType: 'appointment',
      entityId: appointmentId,
      isRead: false,
    });

    await this.notificationRepository.save(notification);
  }
}
