import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { Visit, VisitStatus } from '../visits/entities/visit.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionItem)
    private readonly prescriptionItemRepository: Repository<PrescriptionItem>,
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto, currentUser: User): Promise<Prescription> {
    const { visitId, notes, notesAr, items } = createPrescriptionDto;

    // 1. Find and validate visit
    const visit = await this.visitRepository.findOne({ where: { id: visitId } });
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    // 2. Access control: attending doctor or admin
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || visit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to write prescriptions for this visit');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only doctors and administrators can write prescriptions');
    }

    // 3. BR-09: Associated visit must be in draft status (not completed or cancelled)
    if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('Prescriptions can only be created while the associated visit status is draft');
    }

    // 4. Create prescription with items (cascading)
    const prescription = this.prescriptionRepository.create({
      visitId,
      patientId: visit.patientId,
      doctorId: visit.doctorId,
      notes,
      notesAr,
      items: items.map((item) =>
        this.prescriptionItemRepository.create({
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          route: item.route,
          duration: item.duration,
          instructions: item.instructions,
          instructionsAr: item.instructionsAr,
        }),
      ),
    });

    return this.prescriptionRepository.save(prescription);
  }

  async findAll(
    query: {
      patientId?: number;
      doctorId?: number;
      visitId?: number;
      page?: number;
      limit?: number;
    },
    currentUser: User,
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.prescriptionRepository.createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.items', 'items')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('prescription.doctor', 'doctor')
      .leftJoinAndSelect('prescription.visit', 'visit');

    // Filter by patient role or query params
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        throw new NotFoundException('No patient profile found linked to your user account');
      }
      queryBuilder.andWhere('prescription.patientId = :forcedPatientId', { forcedPatientId: patient.id });
    } else {
      if (query.patientId) {
        queryBuilder.andWhere('prescription.patientId = :patientId', { patientId: query.patientId });
      }
      if (query.doctorId) {
        queryBuilder.andWhere('prescription.doctorId = :doctorId', { doctorId: query.doctorId });
      }
      if (query.visitId) {
        queryBuilder.andWhere('prescription.visitId = :visitId', { visitId: query.visitId });
      }
    }

    queryBuilder.orderBy('prescription.createdAt', 'DESC');
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

  async findOne(id: number, currentUser: User): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: {
        items: true,
        patient: true,
        doctor: true,
        visit: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    // Access control
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient || prescription.patientId !== patient.id) {
        throw new ForbiddenException('You are not authorized to view this prescription');
      }
    }

    return prescription;
  }

  async update(id: number, updatePrescriptionDto: UpdatePrescriptionDto, currentUser: User): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: { visit: true },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const visit = prescription.visit;

    // Access control
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || visit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to update this prescription');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only the attending doctor or an administrator can update prescriptions');
    }

    // BR-09: Associated visit must be in draft status
    if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('Prescriptions can only be modified while the associated visit status is draft');
    }

    const { notes, notesAr, items } = updatePrescriptionDto;

    if (notes !== undefined) prescription.notes = notes;
    if (notesAr !== undefined) prescription.notesAr = notesAr;

    if (items !== undefined) {
      // BR-10: Must contain at least one item
      if (items.length === 0) {
        throw new BadRequestException('A prescription must contain at least one medication item');
      }

      // Delete existing items
      await this.prescriptionItemRepository.delete({ prescriptionId: id });

      // Create new items
      prescription.items = items.map((item) =>
        this.prescriptionItemRepository.create({
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          route: item.route,
          duration: item.duration,
          instructions: item.instructions,
          instructionsAr: item.instructionsAr,
        }),
      );
    }

    await this.prescriptionRepository.save(prescription);

    return this.findOne(id, currentUser);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: { visit: true },
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    const visit = prescription.visit;

    // Access control
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || visit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to delete this prescription');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only the attending doctor or an administrator can delete prescriptions');
    }

    // BR-09: Associated visit must be in draft status
    if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('Prescriptions can only be deleted while the associated visit status is draft');
    }

    await this.prescriptionRepository.remove(prescription);
  }

  async duplicate(id: number, targetVisitId: number, currentUser: User): Promise<Prescription> {
    const originalPrescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: { items: true, visit: true },
    });

    if (!originalPrescription) {
      throw new NotFoundException(`Original prescription with ID ${id} not found`);
    }

    const targetVisit = await this.visitRepository.findOne({ where: { id: targetVisitId } });
    if (!targetVisit) {
      throw new NotFoundException(`Target visit with ID ${targetVisitId} not found`);
    }

    // Access control: must be authorized for both original and target visit
    if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor || originalPrescription.visit.doctorId !== doctor.id || targetVisit.doctorId !== doctor.id) {
        throw new ForbiddenException('You are not authorized to duplicate this prescription');
      }
    } else if (currentUser.role.name !== 'admin') {
      throw new ForbiddenException('Only doctors and administrators can duplicate prescriptions');
    }

    // BR-09: Target visit must be in draft status
    if (targetVisit.status === VisitStatus.COMPLETED || targetVisit.status === VisitStatus.CANCELLED) {
      throw new BadRequestException('Prescriptions can only be duplicated into a draft target visit');
    }

    // Target visit must belong to the same patient
    if (targetVisit.patientId !== originalPrescription.patientId) {
      throw new BadRequestException('Target visit must belong to the same patient as the original prescription');
    }

    // Clone prescription
    const newPrescription = this.prescriptionRepository.create({
      visitId: targetVisitId,
      patientId: targetVisit.patientId,
      doctorId: targetVisit.doctorId,
      notes: originalPrescription.notes,
      notesAr: originalPrescription.notesAr,
      items: originalPrescription.items.map((item) =>
        this.prescriptionItemRepository.create({
          medicationName: item.medicationName,
          dosage: item.dosage,
          frequency: item.frequency,
          route: item.route,
          duration: item.duration,
          instructions: item.instructions,
          instructionsAr: item.instructionsAr,
        }),
      ),
    });

    return this.prescriptionRepository.save(newPrescription);
  }
}
