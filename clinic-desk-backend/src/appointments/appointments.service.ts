import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, currentUser: User): Promise<Appointment> {
    const { patientId, doctorId, date, startTime, endTime, ...rest } = createAppointmentDto;

    // 1. Ownership: If user is patient, they can only book for themselves
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient || patient.id !== patientId) {
        throw new ForbiddenException('You can only book appointments for your own patient profile');
      }
    }

    // 2. Verify Patient existence
    const patient = await this.patientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // 3. Verify Doctor existence
    const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // 4. Ensure start time is before end time
    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be strictly before end time');
    }

    // 5. Validate doctor working hours availability
    if (doctor.workingHours && doctor.workingHours.length > 0) {
      const [year, month, day] = date.split('-').map(Number);
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.

      const workingDay = doctor.workingHours.find(h => h.dayOfWeek === dayOfWeek);
      if (!workingDay || !workingDay.slots || workingDay.slots.length === 0) {
        throw new ConflictException(`Doctor is not available on this day of the week (Day ${dayOfWeek})`);
      }

      // Check if requested slot is completely within one of the working slots
      const fitsInSlot = workingDay.slots.some(slot => {
        return startTime >= slot.start && endTime <= slot.end;
      });

      if (!fitsInSlot) {
        throw new ConflictException(`Selected time slot ${startTime}-${endTime} is outside doctor's defined working hours`);
      }
    }

    // 6. Prevent double booking for the same doctor at the same time
    const conflict = await this.appointmentRepository.createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.date = :date', { date })
      .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: AppointmentStatus.CANCELLED })
      .andWhere('appointment.startTime < :endTime', { endTime })
      .andWhere('appointment.endTime > :startTime', { startTime })
      .getOne();

    if (conflict) {
      throw new ConflictException(`Doctor is already booked between ${conflict.startTime} and ${conflict.endTime} on this date`);
    }

    // 7. Create and Save Appointment
    const appointment = this.appointmentRepository.create({
      patientId,
      doctorId,
      date,
      startTime,
      endTime,
      ...rest,
    });

    return this.appointmentRepository.save(appointment);
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      doctorId?: number;
      patientId?: number;
      status?: AppointmentStatus;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    },
    currentUser: User,
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor');

    // Context Filtering
    if (currentUser.role.name === 'patient') {
      const patient = await this.patientRepository.findOne({ where: { userId: currentUser.id } });
      if (!patient) {
        throw new NotFoundException('No patient profile found linked to your user account');
      }
      queryBuilder.andWhere('appointment.patientId = :forcedPatientId', { forcedPatientId: patient.id });
    } else if (currentUser.role.name === 'doctor') {
      const doctor = await this.doctorRepository.findOne({ where: { userId: currentUser.id } });
      if (!doctor) {
        throw new NotFoundException('No doctor profile found linked to your user account');
      }
      queryBuilder.andWhere('appointment.doctorId = :forcedDoctorId', { forcedDoctorId: doctor.id });
    } else {
      // Admins and Receptionists can query general filters
      if (query.doctorId) {
        queryBuilder.andWhere('appointment.doctorId = :doctorId', { doctorId: query.doctorId });
      }
      if (query.patientId) {
        queryBuilder.andWhere('appointment.patientId = :patientId', { patientId: query.patientId });
      }
    }

    // Filters
    if (query.status) {
      queryBuilder.andWhere('appointment.status = :status', { status: query.status });
    }

    if (query.startDate) {
      queryBuilder.andWhere('appointment.date >= :startDate', { startDate: query.startDate });
    }

    if (query.endDate) {
      queryBuilder.andWhere('appointment.date <= :endDate', { endDate: query.endDate });
    }

    // Global Search
    if (query.search) {
      const searchPattern = `%${query.search}%`;
      queryBuilder.andWhere(
        '(patient.firstName LIKE :search OR ' +
        'patient.lastName LIKE :search OR ' +
        'patient.firstNameAr LIKE :search OR ' +
        'patient.lastNameAr LIKE :search OR ' +
        'patient.patientCode LIKE :search OR ' +
        'doctor.firstName LIKE :search OR ' +
        'doctor.lastName LIKE :search OR ' +
        'appointment.notes LIKE :search)',
        { search: searchPattern }
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'ASC';
    
    const allowedSortFields = ['id', 'date', 'startTime', 'endTime', 'status', 'createdAt'];
    const validatedSortBy = allowedSortFields.includes(sortBy) ? `appointment.${sortBy}` : 'appointment.date';

    queryBuilder.orderBy(validatedSortBy, sortOrder);
    
    if (sortBy === 'date') {
      queryBuilder.addOrderBy('appointment.startTime', sortOrder);
    }

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

  async findOne(id: number, currentUser: User): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        doctor: {
          user: true
        }
      },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    // Role-based Access Restriction
    if (currentUser.role.name === 'patient' && appointment.patient.userId !== currentUser.id) {
      throw new ForbiddenException('You are not authorized to view this appointment');
    }

    if (currentUser.role.name === 'doctor' && appointment.doctor.userId !== currentUser.id) {
      throw new ForbiddenException('You are not authorized to view this appointment');
    }

    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto, currentUser: User): Promise<Appointment> {
    const appointment = await this.findOne(id, currentUser);
    
    // Patient can only reschedule/update their own appointments
    if (currentUser.role.name === 'patient' && appointment.patient.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own appointments');
    }

    const { patientId, doctorId, date, startTime, endTime, rescheduleReason, ...rest } = updateAppointmentDto;

    // Validate patient exist if provided
    if (patientId && patientId !== appointment.patientId) {
      if (currentUser.role.name === 'patient') {
        throw new ForbiddenException('You cannot reassign an appointment to another patient');
      }
      const patient = await this.patientRepository.findOne({ where: { id: patientId } });
      if (!patient) {
        throw new NotFoundException(`Patient with ID ${patientId} not found`);
      }
      appointment.patientId = patientId;
    }

    // Validate doctor exist if provided
    if (doctorId && doctorId !== appointment.doctorId) {
      const doctor = await this.doctorRepository.findOne({ where: { id: doctorId } });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
      }
      appointment.doctorId = doctorId;
    }

    const finalDate = date || appointment.date;
    const finalStart = startTime || appointment.startTime;
    const finalEnd = endTime || appointment.endTime;

    // Ensure start time is before end time
    if (finalStart >= finalEnd) {
      throw new BadRequestException('Start time must be strictly before end time');
    }

    // Validate working hours if date or time slots are modified
    if (date || startTime || endTime || doctorId) {
      const doctorObj = await this.doctorRepository.findOne({ where: { id: appointment.doctorId } });
      if (doctorObj && doctorObj.workingHours && doctorObj.workingHours.length > 0) {
        const [year, month, day] = finalDate.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay();

        const workingDay = doctorObj.workingHours.find(h => h.dayOfWeek === dayOfWeek);
        if (!workingDay || !workingDay.slots || workingDay.slots.length === 0) {
          throw new ConflictException(`Doctor is not available on this day of the week (Day ${dayOfWeek})`);
        }

        const fitsInSlot = workingDay.slots.some(slot => {
          return finalStart >= slot.start && finalEnd <= slot.end;
        });

        if (!fitsInSlot) {
          throw new ConflictException(`Selected time slot ${finalStart}-${finalEnd} is outside doctor's defined working hours`);
        }
      }

      // Check conflicts excluding this appointment
      const conflict = await this.appointmentRepository.createQueryBuilder('appointment')
        .where('appointment.doctorId = :doctorId', { doctorId: appointment.doctorId })
        .andWhere('appointment.date = :date', { date: finalDate })
        .andWhere('appointment.status != :cancelledStatus', { cancelledStatus: AppointmentStatus.CANCELLED })
        .andWhere('appointment.id != :id', { id })
        .andWhere('appointment.startTime < :endTime', { endTime: finalEnd })
        .andWhere('appointment.endTime > :startTime', { startTime: finalStart })
        .getOne();

      if (conflict) {
        throw new ConflictException(`Doctor is already booked between ${conflict.startTime} and ${conflict.endTime} on this date`);
      }

      appointment.date = finalDate;
      appointment.startTime = finalStart;
      appointment.endTime = finalEnd;
      if (rescheduleReason) {
        appointment.rescheduleReason = rescheduleReason;
      }
    }

    Object.assign(appointment, rest);
    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(id: number, updateStatusDto: UpdateAppointmentStatusDto, currentUser: User): Promise<Appointment> {
    const appointment = await this.findOne(id, currentUser);
    const { status, reason } = updateStatusDto;

    // Security Rules for patients cancelling
    if (currentUser.role.name === 'patient') {
      if (appointment.patient.userId !== currentUser.id) {
        throw new ForbiddenException('You can only update the status of your own appointments');
      }
      if (status !== AppointmentStatus.CANCELLED) {
        throw new ForbiddenException('Patients are only permitted to cancel their own appointments');
      }
    }

    appointment.status = status;

    if (status === AppointmentStatus.CANCELLED) {
      appointment.cancellationReason = reason || 'No reason provided';
    } else if (reason) {
      appointment.rescheduleReason = reason;
    }

    return this.appointmentRepository.save(appointment);
  }

  async remove(id: number, currentUser: User): Promise<void> {
    const appointment = await this.findOne(id, currentUser);
    await this.appointmentRepository.remove(appointment);
  }
}
