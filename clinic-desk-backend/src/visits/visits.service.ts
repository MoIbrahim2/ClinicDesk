import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../users/entities/user.entity';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(Diagnosis)
    private readonly diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    private readonly invoicesService: InvoicesService,
  ) {}

  async create(createVisitDto: CreateVisitDto, currentUser: User): Promise<Visit> {
    const { appointmentId, chiefComplaint } = createVisitDto;

    // 1. Find the appointment
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found`);
    }

    // 2. Access Controls: verify attending doctor matches the logged-in doctor
    let doctorId = appointment.doctorId;
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor) {
        throw new ForbiddenException('No doctor profile associated with this user account');
      }
      if (appointment.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to start a visit for another doctor\'s appointment');
      }
      doctorId = doctor.id;
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only doctors and admins can start clinical visits');
    }

    // 3. Prevent duplicate visits for the same appointment
    const existingVisit = await this.visitRepository.findOne({ where: { appointmentId } });
    if (existingVisit) {
      throw new ConflictException(`A visit is already initiated for appointment ID ${appointmentId}`);
    }

    // 4. BR-07: Verify appointment status is checked_in
    if (appointment.status !== AppointmentStatus.CHECKED_IN) {
      throw new BadRequestException('A patient must be checked in (Checked-In status) before a doctor can start a visit');
    }

    // 5. Create Visit record with status in_progress
    const visit = this.visitRepository.create({
      appointmentId,
      patientId: appointment.patientId,
      doctorId,
      checkInTime: new Date(),
      status: VisitStatus.IN_PROGRESS,
      chiefComplaint,
    });

    const savedVisit = await this.visitRepository.save(visit);

    // 6. Transition appointment status to in_progress
    appointment.status = AppointmentStatus.IN_PROGRESS;
    await this.appointmentRepository.save(appointment);

    return savedVisit;
  }

  async updateDraft(id: number, updateVisitDto: UpdateVisitDto, currentUser: User): Promise<Visit> {
    const visit = await this.visitRepository.findOne({ where: { id } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Access Control
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || visit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to update this visit draft');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only the attending doctor or an administrator can update visit drafts');
    }

    // Immutability Check
    if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('Finalized or cancelled visits cannot be modified');
    }

    // Same-day Draft Check
    const today = new Date().toISOString().split('T')[0];
    const visitDate = new Date(visit.createdAt).toISOString().split('T')[0];
    if (visitDate !== today) {
      throw new BadRequestException('Draft visits can only be resumed and updated within the same day of creation');
    }

    const { chiefComplaint, examinationNotes, vitalSigns, diagnoses } = updateVisitDto;

    if (chiefComplaint !== undefined) visit.chiefComplaint = chiefComplaint;
    if (examinationNotes !== undefined) visit.examinationNotes = examinationNotes;
    if (vitalSigns !== undefined) visit.vitalSigns = vitalSigns;

    await this.visitRepository.save(visit);

    // Update Diagnoses if provided
    if (diagnoses !== undefined) {
      // Clear previous diagnoses
      await this.diagnosisRepository.delete({ visitId: visit.id });

      if (diagnoses.length > 0) {
        const diagnosesToSave = diagnoses.map((d) =>
          this.diagnosisRepository.create({
            visitId: visit.id,
            icdCode: d.icdCode,
            diagnosisName: d.diagnosisName,
            diagnosisNameAr: d.diagnosisNameAr,
            notes: d.notes,
            isPrimary: d.isPrimary || false,
          }),
        );
        await this.diagnosisRepository.save(diagnosesToSave);
      }
    }

    // Reload with diagnoses
    const updatedVisit = await this.visitRepository.findOne({
      where: { id },
      relations: { diagnoses: true },
    });
    if (!updatedVisit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }
    return updatedVisit;
  }

  async finalize(id: number, currentUser: User): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { id },
      relations: { diagnoses: true },
    });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Access Control
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || visit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to finalize this visit');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only the attending doctor or an administrator can finalize visits');
    }

    // Immutability Check
    if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('This visit is already finalized or cancelled');
    }

    // BR-08: Every visit must have exactly one primary diagnosis
    if (!visit.diagnoses || visit.diagnoses.length === 0) {
      throw new BadRequestException('At least one diagnosis is required to finalize the visit');
    }

    const primaryCount = visit.diagnoses.filter((d) => d.isPrimary).length;
    if (primaryCount !== 1) {
      throw new BadRequestException('Every visit must have exactly one primary diagnosis (isPrimary: true)');
    }

    // Update visit status
    visit.status = VisitStatus.COMPLETED;
    visit.checkOutTime = new Date();
    const finalizedVisit = await this.visitRepository.save(visit);

    // Sync appointment status to completed
    if (visit.appointmentId) {
      const appointment = await this.appointmentRepository.findOne({ where: { id: visit.appointmentId } });
      if (appointment) {
        appointment.status = AppointmentStatus.COMPLETED;
        await this.appointmentRepository.save(appointment);
      }
    }

    // Auto-generate invoice
    try {
      await this.invoicesService.createFromVisit(finalizedVisit);
    } catch (error) {
      console.error('Invoice auto-generation failed:', error);
    }

    return finalizedVisit;
  }

  async findOne(id: number, currentUser: User): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { id },
      relations: {
        diagnoses: true,
        patient: true,
        doctor: true,
        appointment: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with ID ${id} not found`);
    }

    // Access Control
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient || visit.patientId !== patient.id) {
        throw new ForbiddenException('You are not authorized to view this clinical record');
      }
    } else if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      // Doctors can view visits they conducted or view patient history contextually
      // (For simple MVP/RBAC, we allow doctors to view any patient records, but restrict modifications)
    }

    return visit;
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      patientId?: number;
      doctorId?: number;
      status?: VisitStatus;
    },
    currentUser: User,
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.visitRepository.createQueryBuilder('visit')
      .leftJoinAndSelect('visit.patient', 'patient')
      .leftJoinAndSelect('visit.doctor', 'doctor')
      .leftJoinAndSelect('visit.diagnoses', 'diagnoses');

    // Context Filters
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        throw new NotFoundException('No patient profile found linked to your user account');
      }
      queryBuilder.andWhere('visit.patientId = :forcedPatientId', { forcedPatientId: patient.id });
    } else {
      if (query.patientId) {
        queryBuilder.andWhere('visit.patientId = :patientId', { patientId: query.patientId });
      }
      if (query.doctorId) {
        queryBuilder.andWhere('visit.doctorId = :doctorId', { doctorId: query.doctorId });
      }
    }

    if (query.status) {
      queryBuilder.andWhere('visit.status = :status', { status: query.status });
    }

    queryBuilder.orderBy('visit.checkInTime', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPatientTimeline(patientId: number, currentUser: User): Promise<Visit[]> {
    // Access control: patients can only view their own timeline
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient || patient.id !== patientId) {
        throw new ForbiddenException('You are not authorized to view this patient\'s timeline');
      }
    }

    return this.visitRepository.find({
      where: { patientId },
      relations: { diagnoses: true, doctor: true },
      order: { checkInTime: 'DESC' },
    });
  }
}
