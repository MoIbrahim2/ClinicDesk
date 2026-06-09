import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useValue: mockAppointmentRepo },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(Doctor), useValue: mockDoctorRepo },
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
  });
});
