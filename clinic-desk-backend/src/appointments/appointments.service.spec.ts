import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { NotFoundException, BadRequestException, ForbiddenException, ConflictException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let appointmentRepo: jest.Mocked<Repository<Appointment>>;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let doctorRepo: jest.Mocked<Repository<Doctor>>;

  const mockAdminUser = { id: 1, email: 'admin@test.com', role: { name: 'admin' } } as User;

  beforeEach(async () => {
    const mockAppointmentRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      })),
      remove: jest.fn(),
    };
    const mockPatientRepo = {
      findOne: jest.fn(),
    };
    const mockDoctorRepo = {
      findOne: jest.fn(),
    };
    const mockNotificationsService = {
      notifyReceptionists: jest.fn().mockResolvedValue(null),
      createNotification: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: mockAppointmentRepo },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(Doctor), useValue: mockDoctorRepo },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    appointmentRepo = module.get(getRepositoryToken(Appointment));
    patientRepo = module.get(getRepositoryToken(Patient));
    doctorRepo = module.get(getRepositoryToken(Doctor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if patient does not exist', async () => {
      patientRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ patientId: 99, doctorId: 1, date: '2026-06-15', startTime: '09:00', endTime: '09:30' }, mockAdminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if doctor does not exist', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);
      doctorRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ patientId: 1, doctorId: 99, date: '2026-06-15', startTime: '09:00', endTime: '09:30' }, mockAdminUser)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if startTime >= endTime', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);
      doctorRepo.findOne.mockResolvedValue({ id: 1 } as any);
      await expect(
        service.create({ patientId: 1, doctorId: 1, date: '2026-06-15', startTime: '10:00', endTime: '09:00' }, mockAdminUser)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if patient attempts to book for another patient', async () => {
      const patientUser = { id: 2, role: { name: 'patient' } } as User;
      patientRepo.findOne.mockResolvedValueOnce({ id: 10, userId: 2 } as any); // patient's own profile id is 10

      await expect(
        service.create({ patientId: 11, doctorId: 1, date: '2026-06-15', startTime: '09:00', endTime: '09:30' }, patientUser)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if doctor is not working on the requested day', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);
      // Doctor works only on Mondays (dayOfWeek: 1). 2026-06-14 is Sunday (dayOfWeek: 0)
      const doctor = {
        id: 1,
        workingHours: [{ dayOfWeek: 1, slots: [{ start: '09:00', end: '17:00' }] }],
      } as Doctor;
      doctorRepo.findOne.mockResolvedValue(doctor);

      await expect(
        service.create({ patientId: 1, doctorId: 1, date: '2026-06-14', startTime: '09:00', endTime: '09:30' }, mockAdminUser)
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if time slot is outside doctor working hours', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);
      // 2026-06-15 is Monday (dayOfWeek: 1)
      const doctor = {
        id: 1,
        workingHours: [{ dayOfWeek: 1, slots: [{ start: '09:00', end: '12:00' }] }],
      } as Doctor;
      doctorRepo.findOne.mockResolvedValue(doctor);

      await expect(
        service.create({ patientId: 1, doctorId: 1, date: '2026-06-15', startTime: '12:00', endTime: '13:00' }, mockAdminUser)
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if doctor is double booked', async () => {
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);
      const doctor = {
        id: 1,
        workingHours: [{ dayOfWeek: 1, slots: [{ start: '09:00', end: '17:00' }] }],
      } as Doctor;
      doctorRepo.findOne.mockResolvedValue(doctor);

      // Mock query builder to return conflict
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 999, startTime: '09:00', endTime: '09:30' }),
      };
      appointmentRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await expect(
        service.create({ patientId: 1, doctorId: 1, date: '2026-06-15', startTime: '09:15', endTime: '09:45' }, mockAdminUser)
      ).rejects.toThrow(ConflictException);
    });
  });
});
