import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Visit, VisitStatus } from '../visits/entities/visit.entity';
import { Invoice, InvoiceStatus } from '../invoices/entities/invoice.entity';
import { Payment } from '../invoices/entities/payment.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  async getSummary(currentUser: User) {
    const todayDateStr = new Date().toISOString().split('T')[0];
    const role = currentUser.role.name;

    if (role === 'admin') {
      // 1. Total Patients
      const totalPatients = await this.patientRepository.count();

      // 2. Monthly Revenue (payments in the current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const paymentsRes = await this.paymentRepository.createQueryBuilder('payment')
        .where('payment.paymentDate >= :startOfMonth', { startOfMonth })
        .andWhere('payment.paymentDate < :startOfNextMonth', { startOfNextMonth })
        .select('SUM(payment.amount)', 'sum')
        .getRawOne();
      const monthlyRevenue = Number(paymentsRes?.sum || 0);

      // 3. Today's Appointments
      const todayAppointments = await this.appointmentRepository.count({
        where: { date: todayDateStr }
      });

      // 4. Active Staff (Doctors)
      const activeStaff = await this.doctorRepository.count();

      // 5. Appointment Outcomes Breakdown today
      const todayAppointmentsList = await this.appointmentRepository.find({
        where: { date: todayDateStr }
      });
      const appointmentOutcomes = {
        scheduled: 0,
        confirmed: 0,
        checked_in: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
      };
      todayAppointmentsList.forEach(appt => {
        if (appointmentOutcomes[appt.status] !== undefined) {
          appointmentOutcomes[appt.status]++;
        }
      });

      // 6. Recent Activity Feed
      const recentVisits = await this.visitRepository.find({
        relations: { patient: true, doctor: true },
        order: { checkInTime: 'DESC' },
        take: 5
      });

      const recentPayments = await this.paymentRepository.find({
        relations: { invoice: { patient: true } },
        order: { paymentDate: 'DESC' },
        take: 5
      });

      const recentAppointments = await this.appointmentRepository.find({
        relations: { patient: true, doctor: true },
        order: { createdAt: 'DESC' },
        take: 5
      });

      const activities = [
        ...recentVisits.map(v => ({
          id: `visit-${v.id}`,
          type: 'visit_check_in',
          time: v.checkInTime,
          details: {
            visitId: v.id,
            patientName: `${v.patient.firstName} ${v.patient.lastName}`,
            patientNameAr: `${v.patient.firstNameAr || ''} ${v.patient.lastNameAr || ''}`.trim(),
            doctorName: `${v.doctor.firstName} ${v.doctor.lastName}`,
            doctorNameAr: `${v.doctor.firstNameAr || ''} ${v.doctor.lastNameAr || ''}`.trim()
          }
        })),
        ...recentPayments.map(p => ({
          id: `payment-${p.id}`,
          type: 'payment_recorded',
          time: p.paymentDate,
          details: {
            paymentId: p.id,
            amount: Number(p.amount),
            patientName: p.invoice?.patient ? `${p.invoice.patient.firstName} ${p.invoice.patient.lastName}` : 'N/A',
            patientNameAr: p.invoice?.patient ? `${p.invoice.patient.firstNameAr || ''} ${p.invoice.patient.lastNameAr || ''}`.trim() : 'N/A'
          }
        })),
        ...recentAppointments.map(a => ({
          id: `appt-${a.id}`,
          type: 'appointment_booked',
          time: a.createdAt,
          details: {
            appointmentId: a.id,
            date: a.date,
            startTime: a.startTime,
            patientName: `${a.patient.firstName} ${a.patient.lastName}`,
            patientNameAr: `${a.patient.firstNameAr || ''} ${a.patient.lastNameAr || ''}`.trim(),
            doctorName: `${a.doctor.firstName} ${a.doctor.lastName}`,
            doctorNameAr: `${a.doctor.firstNameAr || ''} ${a.doctor.lastNameAr || ''}`.trim()
          }
        }))
      ]
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 5);

      return {
        role,
        kpis: {
          totalPatients,
          monthlyRevenue,
          todayAppointments,
          activeStaff
        },
        appointmentOutcomes,
        activities
      };
    }

    if (role === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor) {
        throw new NotFoundException('Doctor profile not found linked to this user');
      }

      // Today's appointments count
      const todayAppointments = await this.appointmentRepository.count({
        where: { doctorId: doctor.id, date: todayDateStr }
      });

      // Today's visits count
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayVisits = await this.visitRepository.count({
        where: { doctorId: doctor.id, checkInTime: MoreThanOrEqual(startOfToday) }
      });

      // Pending draft visits
      const pendingVisits = await this.visitRepository.count({
        where: { doctorId: doctor.id, status: VisitStatus.IN_PROGRESS }
      });

      // Today's active queue
      const todayQueue = await this.appointmentRepository.find({
        where: [
          { doctorId: doctor.id, date: todayDateStr, status: AppointmentStatus.CHECKED_IN },
          { doctorId: doctor.id, date: todayDateStr, status: AppointmentStatus.IN_PROGRESS }
        ],
        relations: { patient: true },
        order: { startTime: 'ASC' }
      });

      return {
        role,
        kpis: {
          todayAppointments,
          todayVisits,
          pendingVisits
        },
        todayQueue: todayQueue.map(q => ({
          id: q.id,
          startTime: q.startTime,
          status: q.status,
          patientId: q.patientId,
          patientName: `${q.patient.firstName} ${q.patient.lastName}`,
          patientNameAr: `${q.patient.firstNameAr || ''} ${q.patient.lastNameAr || ''}`.trim(),
          gender: q.patient.gender
        }))
      };
    }

    if (role === 'receptionist') {
      // Today's total appointments
      const todayAppointments = await this.appointmentRepository.count({
        where: { date: todayDateStr }
      });

      // Checked-in count today
      const checkedInToday = await this.appointmentRepository.count({
        where: { date: todayDateStr, status: AppointmentStatus.CHECKED_IN }
      });

      // Completed today
      const completedToday = await this.appointmentRepository.count({
        where: { date: todayDateStr, status: AppointmentStatus.COMPLETED }
      });

      // Pending (unpaid/partially paid) invoices count
      const pendingInvoices = await this.invoiceRepository.createQueryBuilder('invoice')
        .where('invoice.status IN (:...statuses)', { statuses: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] })
        .getCount();

      // Receptionist active queue (across all doctors)
      const activeQueue = await this.appointmentRepository.find({
        where: [
          { date: todayDateStr, status: AppointmentStatus.CHECKED_IN },
          { date: todayDateStr, status: AppointmentStatus.IN_PROGRESS }
        ],
        relations: { patient: true, doctor: true },
        order: { startTime: 'ASC' }
      });

      return {
        role,
        kpis: {
          todayAppointments,
          checkedInToday,
          completedToday,
          pendingInvoices
        },
        activeQueue: activeQueue.map(q => ({
          id: q.id,
          startTime: q.startTime,
          status: q.status,
          patientName: `${q.patient.firstName} ${q.patient.lastName}`,
          patientNameAr: `${q.patient.firstNameAr || ''} ${q.patient.lastNameAr || ''}`.trim(),
          doctorName: `${q.doctor.firstName} ${q.doctor.lastName}`,
          doctorNameAr: `${q.doctor.firstNameAr || ''} ${q.doctor.lastNameAr || ''}`.trim()
        }))
      };
    }

    if (role === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        throw new NotFoundException('Patient profile not found linked to this user');
      }

      // Upcoming appointments count (today or future scheduled/confirmed)
      const upcomingAppointments = await this.appointmentRepository.createQueryBuilder('appointment')
        .where('appointment.patientId = :patientId', { patientId: patient.id })
        .andWhere('appointment.date >= :todayDateStr', { todayDateStr })
        .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] })
        .getCount();

      // Active Prescriptions count
      const activePrescriptions = await this.prescriptionRepository.count({
        where: { patientId: patient.id }
      });

      // Unpaid Invoices count
      const unpaidInvoices = await this.invoiceRepository.createQueryBuilder('invoice')
        .where('invoice.patientId = :patientId', { patientId: patient.id })
        .andWhere('invoice.status IN (:...statuses)', { statuses: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] })
        .getCount();

      // Upcoming Appointments List
      const upcomingList = await this.appointmentRepository.createQueryBuilder('appointment')
        .leftJoinAndSelect('appointment.doctor', 'doctor')
        .where('appointment.patientId = :patientId', { patientId: patient.id })
        .andWhere('appointment.date >= :todayDateStr', { todayDateStr })
        .andWhere('appointment.status IN (:...statuses)', { statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] })
        .orderBy('appointment.date', 'ASC')
        .addOrderBy('appointment.startTime', 'ASC')
        .take(5)
        .getMany();

      // Recent Prescriptions list
      const recentPrescriptions = await this.prescriptionRepository.find({
        where: { patientId: patient.id },
        relations: { doctor: true, items: true },
        order: { createdAt: 'DESC' },
        take: 5
      });

      return {
        role,
        kpis: {
          upcomingAppointments,
          activePrescriptions,
          unpaidInvoices
        },
        upcomingList: upcomingList.map(a => ({
          id: a.id,
          date: a.date,
          startTime: a.startTime,
          status: a.status,
          doctorName: `${a.doctor.firstName} ${a.doctor.lastName}`,
          doctorNameAr: `${a.doctor.firstNameAr || ''} ${a.doctor.lastNameAr || ''}`.trim(),
          specialization: a.doctor.specialization,
          specializationAr: a.doctor.specializationAr
        })),
        recentPrescriptions: recentPrescriptions.map(rx => ({
          id: rx.id,
          createdAt: rx.createdAt,
          medicationsCount: rx.items?.length || 0,
          doctorName: `${rx.doctor.firstName} ${rx.doctor.lastName}`,
          doctorNameAr: `${rx.doctor.firstNameAr || ''} ${rx.doctor.lastNameAr || ''}`.trim()
        }))
      };
    }

    return { role, kpis: {} };
  }

  async getRevenueReport(query: {
    startDate?: string;
    endDate?: string;
    doctorId?: number;
    paymentMethod?: string;
  }) {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('invoice.patient', 'patient')
      .leftJoin('invoice.visit', 'visit')
      .leftJoinAndSelect('visit.doctor', 'doctor');

    if (query.startDate) {
      queryBuilder.andWhere('payment.paymentDate >= :startDate', { startDate: new Date(query.startDate) });
    }
    if (query.endDate) {
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('payment.paymentDate <= :endDate', { endDate: end });
    }
    if (query.doctorId) {
      queryBuilder.andWhere('visit.doctorId = :doctorId', { doctorId: query.doctorId });
    }
    if (query.paymentMethod) {
      queryBuilder.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod: query.paymentMethod });
    }

    queryBuilder.orderBy('payment.paymentDate', 'DESC');

    const payments = await queryBuilder.getMany();

    // Aggregates
    let totalRevenue = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    let insuranceTotal = 0;
    let otherTotal = 0;

    payments.forEach(p => {
      const amt = Number(p.amount);
      totalRevenue += amt;
      if (p.paymentMethod === 'cash') cashTotal += amt;
      else if (p.paymentMethod === 'card') cardTotal += amt;
      else if (p.paymentMethod === 'insurance') insuranceTotal += amt;
      else otherTotal += amt;
    });

    // Trend analysis for charting (group by date)
    const trendMap = new Map<string, number>();
    payments.forEach(p => {
      const dateStr = new Date(p.paymentDate).toISOString().split('T')[0];
      trendMap.set(dateStr, (trendMap.get(dateStr) || 0) + Number(p.amount));
    });
    const trend = Array.from(trendMap.entries()).map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2))
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      payments: payments.map(p => ({
        id: p.id,
        paymentDate: p.paymentDate,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        notes: p.notes,
        invoiceNumber: p.invoice?.invoiceNumber,
        patientName: p.invoice?.patient ? `${p.invoice.patient.firstName} ${p.invoice.patient.lastName}` : 'N/A',
        patientNameAr: p.invoice?.patient ? `${p.invoice.patient.firstNameAr || ''} ${p.invoice.patient.lastNameAr || ''}`.trim() : 'N/A',
        doctorName: p.invoice?.visit?.doctor ? `${p.invoice.visit.doctor.firstName} ${p.invoice.visit.doctor.lastName}` : 'N/A',
        doctorNameAr: p.invoice?.visit?.doctor ? `${p.invoice.visit.doctor.firstNameAr || ''} ${p.invoice.visit.doctor.lastNameAr || ''}`.trim() : 'N/A'
      })),
      aggregates: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        cashTotal: Number(cashTotal.toFixed(2)),
        cardTotal: Number(cardTotal.toFixed(2)),
        insuranceTotal: Number(insuranceTotal.toFixed(2)),
        otherTotal: Number(otherTotal.toFixed(2)),
        count: payments.length
      },
      trend
    };
  }

  async getAppointmentsReport(query: {
    startDate?: string;
    endDate?: string;
    doctorId?: number;
  }) {
    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    if (query.startDate) {
      queryBuilder.andWhere('appointment.date >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      queryBuilder.andWhere('appointment.date <= :endDate', { endDate: query.endDate });
    }
    if (query.doctorId) {
      queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId: query.doctorId });
    }

    const appointments = await queryBuilder.getMany();

    // Outcomes status breakdown
    const statusBreakdown = {
      scheduled: 0,
      confirmed: 0,
      checked_in: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    };
    
    // Demographics
    const genderBreakdown = {
      male: 0,
      female: 0,
      other: 0
    };
    const ageBreakdown = {
      under18: 0,
      age18_35: 0,
      age36_50: 0,
      age51_65: 0,
      over65: 0
    };

    appointments.forEach(a => {
      if (statusBreakdown[a.status] !== undefined) {
        statusBreakdown[a.status]++;
      }
      
      if (a.patient) {
        const gen = (a.patient.gender || '').toLowerCase();
        if (gen === 'male') genderBreakdown.male++;
        else if (gen === 'female') genderBreakdown.female++;
        else genderBreakdown.other++;

        if (a.patient.dateOfBirth) {
          const birthDate = new Date(a.patient.dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (age < 18) ageBreakdown.under18++;
          else if (age <= 35) ageBreakdown.age18_35++;
          else if (age <= 50) ageBreakdown.age36_50++;
          else if (age <= 65) ageBreakdown.age51_65++;
          else ageBreakdown.over65++;
        }
      }
    });

    return {
      statusBreakdown,
      genderBreakdown,
      ageBreakdown,
      totalCount: appointments.length
    };
  }
}
