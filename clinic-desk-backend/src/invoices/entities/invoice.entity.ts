import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Visit } from '../../visits/entities/visit.entity';
import { InvoiceItem } from './invoice-item.entity';
import { Payment } from './payment.entity';

export enum InvoiceStatus {
  UNPAID = 'unpaid',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  VOIDED = 'voided',
}

@Entity('invoices')
@Index(['patientId'])
@Index(['visitId'])
@Index(['status'])
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_number', unique: true, length: 100 })
  invoiceNumber: string;

  @Column({ name: 'patient_id' })
  patientId: number;

  @ManyToOne(() => Patient, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'visit_id', nullable: true })
  visitId: number;

  @ManyToOne(() => Visit, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'visit_id' })
  visit: Visit;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.UNPAID,
  })
  status: InvoiceStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ name: 'balance_due', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balanceDue: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];

  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
