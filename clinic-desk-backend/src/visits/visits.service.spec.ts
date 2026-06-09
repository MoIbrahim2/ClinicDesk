import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisitsService } from './visits.service';
import { Visit, VisitStatus } from './entities/visit.entity';
import { Diagnosis } from './entities/diagnosis.entity';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { User } from '../users/entities/user.entity';

describe('VisitsService', () => {
  let service: VisitsService;
  let visitRepo: jest.Mocked<Repository<Visit>>;
  let diagnosisRepo: jest.Mocked<Repository<Diagnosis>>;
  let appointmentRepo: jest.Mocked<Repository<Appointment>>;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let doctorRepo: jest.Mocked<Repository<Doctor>>;

  const mockAdminUser = { id: 1, email: 'admin@test.com', role: { name: 'admin' } } as User;
  const mockDoctorUser = { id: 2, email: 'doctor@test.com', role: { name: 'doctor' } } as User;

  beforeEach(async () => {
    const mockVisitRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      })),
    };
    const mockDiagnosisRepo = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };
    const mockAppointmentRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const mockPatientRepo = {
      findOne: jest.fn(),
    };
    const mockDoctorRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        { provide: getRepositoryToken(Visit), useValue: mockVisitRepo },
        { provide: getRepositoryToken(Diagnosis), useValue: mockDiagnosisRepo },
        { provide: getRepositoryToken(Appointment), useValue: mockAppointmentRepo },
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(Doctor), useValue: mockDoctorRepo },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
    visitRepo = module.get(getRepositoryToken(Visit));
    diagnosisRepo = module.get(getRepositoryToken(Diagnosis));
    appointmentRepo = module.get(getRepositoryToken(Appointment));
    patientRepo = module.get(getRepositoryToken(Patient));
    doctorRepo = module.get(getRepositoryToken(Doctor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if appointment does not exist', async () => {
      appointmentRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create({ appointmentId: 99, chiefComplaint: 'complaint' }, mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if appointment is not checked_in', async () => {
      appointmentRepo.findOne.mockResolvedValue({ id: 1, status: AppointmentStatus.SCHEDULED, doctorId: 1 } as any);
      await expect(
        service.create({ appointmentId: 1, chiefComplaint: 'complaint' }, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a visit and set appointment to in_progress', async () => {
      const mockAppointment = { id: 1, status: AppointmentStatus.CHECKED_IN, doctorId: 1, patientId: 5 } as any;
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      visitRepo.findOne.mockResolvedValue(null);
      visitRepo.create.mockReturnValue({ id: 10 } as any);
      visitRepo.save.mockResolvedValue({ id: 10, status: VisitStatus.IN_PROGRESS } as any);

      const result = await service.create({ appointmentId: 1, chiefComplaint: 'complaint' }, mockAdminUser);
      expect(result.id).toBe(10);
      expect(appointmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: AppointmentStatus.IN_PROGRESS }),
      );
    });
  });

  describe('finalize', () => {
    it('should throw BadRequestException if visit has no diagnoses', async () => {
      const mockVisit = { id: 10, status: VisitStatus.IN_PROGRESS, doctorId: 1, diagnoses: [] } as any;
      visitRepo.findOne.mockResolvedValue(mockVisit);

      await expect(
        service.finalize(10, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visit has no primary diagnosis', async () => {
      const mockVisit = {
        id: 10,
        status: VisitStatus.IN_PROGRESS,
        doctorId: 1,
        diagnoses: [
          { id: 1, isPrimary: false },
          { id: 2, isPrimary: false },
        ],
      } as any;
      visitRepo.findOne.mockResolvedValue(mockVisit);

      await expect(
        service.finalize(10, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if visit has multiple primary diagnoses', async () => {
      const mockVisit = {
        id: 10,
        status: VisitStatus.IN_PROGRESS,
        doctorId: 1,
        diagnoses: [
          { id: 1, isPrimary: true },
          { id: 2, isPrimary: true },
        ],
      } as any;
      visitRepo.findOne.mockResolvedValue(mockVisit);

      await expect(
        service.finalize(10, mockAdminUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully finalize the visit and update appointment to completed', async () => {
      const mockVisit = {
        id: 10,
        appointmentId: 1,
        status: VisitStatus.IN_PROGRESS,
        doctorId: 1,
        diagnoses: [
          { id: 1, isPrimary: true },
        ],
      } as any;
      const mockAppointment = { id: 1, status: AppointmentStatus.IN_PROGRESS } as any;
      visitRepo.findOne.mockResolvedValue(mockVisit);
      appointmentRepo.findOne.mockResolvedValue(mockAppointment);
      visitRepo.save.mockResolvedValue({ ...mockVisit, status: VisitStatus.COMPLETED } as any);

      const result = await service.finalize(10, mockAdminUser);
      expect(result.status).toBe(VisitStatus.COMPLETED);
      expect(appointmentRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: AppointmentStatus.COMPLETED }),
      );
    });
  });
});
