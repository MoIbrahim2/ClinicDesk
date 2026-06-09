import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true, unique: true })
  userId: number;

  @OneToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'first_name_ar', length: 100, nullable: true })
  firstNameAr: string;

  @Column({ name: 'last_name_ar', length: 100, nullable: true })
  lastNameAr: string;

  @Column({ length: 150 })
  specialization: string;

  @Column({ name: 'specialization_ar', length: 150, nullable: true })
  specializationAr: string;

  @Column({ name: 'license_number', length: 50, unique: true, nullable: true })
  licenseNumber: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'bio_ar', type: 'text', nullable: true })
  bioAr: string;

  @Column({ name: 'working_hours', type: 'json', nullable: true })
  workingHours: {
    dayOfWeek: number; // 0 (Sunday) to 6 (Saturday)
    slots: { start: string; end: string }[];
  }[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
