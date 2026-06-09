import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne, JoinColumn, Index } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Diagnosis } from './diagnosis.entity';

export enum VisitStatus {
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface VitalSigns {
  bp?: string;       // e.g., "120/80"
  temp?: number;     // e.g., 37.0
  pulse?: number;    // e.g., 72
  weight?: number;   // e.g., 70.5
  height?: number;   // e.g., 175
}

@Entity('visits')
@Index(['patientId'])
@Index(['doctorId'])
@Index(['status'])
export class Visit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  appointmentId: number;

  @OneToOne(() => Appointment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  patientId: number;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: number;

  @ManyToOne(() => Doctor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  checkInTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkOutTime: Date;

  @Column({ type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'json', nullable: true })
  vitalSigns: VitalSigns;

  @Column({ type: 'text', nullable: true })
  examinationNotes: string;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.CHECKED_IN,
  })
  status: VisitStatus;

  @OneToMany(() => Diagnosis, (diagnosis) => diagnosis.visit, { cascade: true })
  diagnoses: Diagnosis[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
