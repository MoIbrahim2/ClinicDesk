import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Invoice } from './invoice.entity';
import { User } from '../../users/entities/user.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  INSURANCE = 'insurance',
  OTHER = 'other',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @ManyToOne(() => Invoice, (invoice) => invoice.payments, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @CreateDateColumn({ name: 'payment_date' })
  paymentDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by_id' })
  createdById: number;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  creator: User;
}
