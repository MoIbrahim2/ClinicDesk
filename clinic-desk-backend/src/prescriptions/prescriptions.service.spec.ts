import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionsService } from './prescriptions.service';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { Visit, VisitStatus } from '../visits/entities/visit.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prescriptionRepo: jest.Mocked<Repository<Prescription>>;
  let prescriptionItemRepo: jest.Mocked<Repository<PrescriptionItem>>;
  let visitRepo: jest.Mocked<Repository<Visit>>;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let doctorRepo: jest.Mocked<Repository<Doctor>>;

  const mockAdminUser = { id: 1, role: { name: 'admin' } } as User;
  const mockDoctorUser = { id: 2, role: { name: 'doctor' } } as User;
  const mockPatientUser = { id: 3, role: { name: 'patient' } } as User;

  beforeEach(async () => {
    const createMockRepo = () => ({
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((val) => val),
      save: jest.fn((val) => val),
      delete: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        { provide: getRepositoryToken(Prescription), useValue: createMockRepo() },
        { provide: getRepositoryToken(PrescriptionItem), useValue: createMockRepo() },
        { provide: getRepositoryToken(Visit), useValue: createMockRepo() },
        { provide: getRepositoryToken(Patient), useValue: createMockRepo() },
        { provide: getRepositoryToken(Doctor), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
    prescriptionRepo = module.get(getRepositoryToken(Prescription));
    prescriptionItemRepo = module.get(getRepositoryToken(PrescriptionItem));
    visitRepo = module.get(getRepositoryToken(Visit));
    patientRepo = module.get(getRepositoryToken(Patient));
    doctorRepo = module.get(getRepositoryToken(Doctor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw NotFoundException if visit not found', async () => {
      visitRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ visitId: 99, items: [] }, mockAdminUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is doctor but not the attending doctor', async () => {
      visitRepo.findOne.mockResolvedValue({ id: 10, doctorId: 5, status: VisitStatus.DRAFT } as any);
      doctorRepo.findOne.mockResolvedValue({ id: 6 } as any); // logged in doctor is id 6, attending is id 5

      await expect(
        service.create({ visitId: 10, items: [] }, mockDoctorUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if visit is completed', async () => {
      visitRepo.findOne.mockResolvedValue({ id: 10, doctorId: 5, status: VisitStatus.COMPLETED } as any);
      doctorRepo.findOne.mockResolvedValue({ id: 5 } as any);

      await expect(
        service.create({ visitId: 10, items: [] }, mockDoctorUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create prescription successfully', async () => {
      visitRepo.findOne.mockResolvedValue({ id: 10, doctorId: 5, status: VisitStatus.DRAFT, patientId: 8 } as any);
      doctorRepo.findOne.mockResolvedValue({ id: 5 } as any);
      prescriptionRepo.save.mockImplementation(async (presc) => ({ id: 50, ...presc } as any));

      const dto = {
        visitId: 10,
        notes: 'Take with food',
        items: [
          {
            medicationName: 'Aspirin',
            dosage: '100mg',
            frequency: 'Once daily',
            route: 'Oral',
            duration: '7 days',
          },
        ],
      };

      const result = await service.create(dto, mockDoctorUser);
      expect(result).toBeDefined();
      expect(result.id).toBe(50);
      expect(result.notes).toBe('Take with food');
      expect(result.items.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should allow patient to view their own prescription', async () => {
      prescriptionRepo.findOne.mockResolvedValue({ id: 50, patientId: 8 } as any);
      patientRepo.findOne.mockResolvedValue({ id: 8 } as any);

      const result = await service.findOne(50, mockPatientUser);
      expect(result).toBeDefined();
      expect(result.id).toBe(50);
    });

    it('should throw ForbiddenException if patient accesses another patient prescription', async () => {
      prescriptionRepo.findOne.mockResolvedValue({ id: 50, patientId: 8 } as any);
      patientRepo.findOne.mockResolvedValue({ id: 9 } as any);

      await expect(service.findOne(50, mockPatientUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should throw BadRequestException if update items array is empty', async () => {
      prescriptionRepo.findOne.mockResolvedValue({
        id: 50,
        visit: { doctorId: 5, status: VisitStatus.DRAFT },
      } as any);
      doctorRepo.findOne.mockResolvedValue({ id: 5 } as any);

      await expect(
        service.update(50, { items: [] }, mockDoctorUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('duplicate', () => {
    it('should duplicate prescription successfully', async () => {
      const original = {
        id: 50,
        patientId: 8,
        notes: 'Original notes',
        items: [{ medicationName: 'Aspirin', dosage: '100mg' }],
        visit: { doctorId: 5 },
      } as any;
      prescriptionRepo.findOne.mockResolvedValue(original);

      const targetVisit = {
        id: 60,
        status: VisitStatus.DRAFT,
        patientId: 8,
        doctorId: 5,
      } as any;
      visitRepo.findOne.mockResolvedValue(targetVisit);
      doctorRepo.findOne.mockResolvedValue({ id: 5 } as any);
      prescriptionRepo.save.mockImplementation(async (presc) => ({ id: 51, ...presc } as any));

      const result = await service.duplicate(50, 60, mockDoctorUser);
      expect(result).toBeDefined();
      expect(result.id).toBe(51);
      expect(result.notes).toBe('Original notes');
      expect(result.items.length).toBe(1);
    });

    it('should throw BadRequestException if patient IDs do not match during duplication', async () => {
      const original = {
        id: 50,
        patientId: 8,
        visit: { doctorId: 5 },
      } as any;
      prescriptionRepo.findOne.mockResolvedValue(original);

      const targetVisit = {
        id: 60,
        status: VisitStatus.DRAFT,
        patientId: 9, // different patient
        doctorId: 5,
      } as any;
      visitRepo.findOne.mockResolvedValue(targetVisit);
      doctorRepo.findOne.mockResolvedValue({ id: 5 } as any);

      await expect(service.duplicate(50, 60, mockDoctorUser)).rejects.toThrow(BadRequestException);
    });
  });
});
