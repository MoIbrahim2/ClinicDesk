import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Visit } from '../visits/entities/visit.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../invoices/entities/payment.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Doctor,
      Appointment,
      Visit,
      Invoice,
      Payment,
      Prescription,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
