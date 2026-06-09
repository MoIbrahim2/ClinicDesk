import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Visit } from './visit.entity';

@Entity('diagnoses')
@Index(['visitId'])
export class Diagnosis {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  visitId: number;

  @ManyToOne(() => Visit, (visit) => visit.diagnoses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visitId' })
  visit: Visit;

  @Column({ length: 10, nullable: true })
  icdCode: string; // e.g., "J06.9"

  @Column({ length: 255 })
  diagnosisName: string; // English

  @Column({ length: 255, nullable: true })
  diagnosisNameAr: string; // Arabic

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
