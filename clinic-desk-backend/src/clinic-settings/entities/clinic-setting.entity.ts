import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('clinic_settings')
export class ClinicSetting {
  @PrimaryColumn()
  id: number; // Singleton: always 1

  @Column({ name: 'clinic_name', length: 200 })
  clinicName: string;

  @Column({ name: 'clinic_name_ar', length: 200, nullable: true })
  clinicNameAr: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'address_ar', type: 'text', nullable: true })
  addressAr: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;

  @Column({ name: 'working_hours', type: 'json', nullable: true })
  workingHours: {
    dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
    slots: { start: string; end: string }[];
  }[];

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  taxRate: number;

  @Column({ length: 10, default: 'SAR' })
  currency: string;

  @Column({ name: 'default_language', length: 5, default: 'en' })
  defaultLanguage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
