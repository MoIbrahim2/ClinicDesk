import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('prescription_items')
@Index(['prescriptionId'])
export class PrescriptionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  prescriptionId: number;

  @ManyToOne(() => Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @Column({ length: 255 })
  medicationName: string;

  @Column({ length: 100 })
  dosage: string; // e.g. "500 mg", "1 tablet"

  @Column({ length: 100 })
  frequency: string; // e.g. "Once daily", "TID"

  @Column({ length: 100, nullable: true })
  route: string; // e.g. "Oral", "Intravenous"

  @Column({ length: 100 })
  duration: string; // e.g. "7 days"

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  instructionsAr: string;
}
