import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Visit } from '../../visits/entities/visit.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { PrescriptionItem } from './prescription-item.entity';

@Entity('prescriptions')
@Index(['visitId'])
@Index(['patientId'])
@Index(['doctorId'])
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  visitId: number;

  @ManyToOne(() => Visit, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitId' })
  visit: Visit;

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

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  notesAr: string;

  @OneToMany(() => PrescriptionItem, (item) => item.prescription, { cascade: true })
  items: PrescriptionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
