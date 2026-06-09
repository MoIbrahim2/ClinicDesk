import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientsService } from './patients.service';
import { Patient } from './entities/patient.entity';
import { User } from '../users/entities/user.entity';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PatientsService', () => {
  let service: PatientsService;
  let patientRepo: jest.Mocked<Repository<Patient>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockPatientRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      remove: jest.fn(),
    };
    const mockUserRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        { provide: getRepositoryToken(Patient), useValue: mockPatientRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    patientRepo = module.get(getRepositoryToken(Patient));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient successfully', async () => {
      const dto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        phone: '0123456789',
      };
      const savedPatient = { id: 1, ...dto, createdBy: 5 };
      patientRepo.findOne.mockResolvedValue(null);
      patientRepo.create.mockReturnValue(savedPatient as any);
      patientRepo.save.mockResolvedValue(savedPatient as any);

      const result = await service.create(dto, 5);
      expect(result).toEqual(savedPatient);
      expect(patientRepo.create).toHaveBeenCalledWith({ ...dto, createdBy: 5 });
    });

    it('should throw ConflictException if nationalId already exists', async () => {
      const dto = {
        nationalId: '12345',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        phone: '0123456789',
      };
      patientRepo.findOne.mockResolvedValue({ id: 1 } as any);

      await expect(service.create(dto, 5)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a patient profile if authorized', async () => {
      const patient = { id: 1, userId: 10, firstName: 'John' } as any;
      const user = { id: 10, role: { name: 'patient' } } as any;
      patientRepo.findOne.mockResolvedValue(patient);

      const result = await service.findOne(1, user);
      expect(result).toEqual(patient);
    });

    it('should throw ForbiddenException if patient accesses another patient profile', async () => {
      const patient = { id: 1, userId: 10, firstName: 'John' } as any;
      const user = { id: 20, role: { name: 'patient' } } as any;
      patientRepo.findOne.mockResolvedValue(patient);

      await expect(service.findOne(1, user)).rejects.toThrow(ForbiddenException);
    });

    it('should return patient profile if receptionist accesses it', async () => {
      const patient = { id: 1, userId: 10, firstName: 'John' } as any;
      const user = { id: 30, role: { name: 'receptionist' } } as any;
      patientRepo.findOne.mockResolvedValue(patient);

      const result = await service.findOne(1, user);
      expect(result).toEqual(patient);
    });

    it('should throw NotFoundException if patient does not exist', async () => {
      const user = { id: 30, role: { name: 'receptionist' } } as any;
      patientRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999, user)).rejects.toThrow(NotFoundException);
    });
  });
});
