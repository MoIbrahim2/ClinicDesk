import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'title_ar', length: 255, nullable: true })
  titleAr: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'message_ar', type: 'text', nullable: true })
  messageAr: string;

  @Column({ length: 50, default: 'info' })
  type: string; // e.g. 'check_in', 'appointment_request', 'reminder_24h', 'reminder_1h'

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ length: 255, nullable: true })
  link: string; // e.g. '/visits', '/appointments'

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string; // e.g. 'appointment'

  @Column({ name: 'entity_id', nullable: true })
  entityId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
