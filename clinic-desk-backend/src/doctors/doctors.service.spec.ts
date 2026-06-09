import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';
import { User } from '../users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let doctorRepo: jest.Mocked<Repository<Doctor>>;
  let userRepo: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockDoctorRepo = {
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
        DoctorsService,
        { provide: getRepositoryToken(Doctor), useValue: mockDoctorRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
    doctorRepo = module.get(getRepositoryToken(Doctor));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a doctor successfully', async () => {
      const dto = {
        firstName: 'Alice',
        lastName: 'Smith',
        specialization: 'Cardiology',
        phone: '01012345678',
      };
      const savedDoctor = { id: 1, ...dto };
      doctorRepo.findOne.mockResolvedValue(null);
      doctorRepo.create.mockReturnValue(savedDoctor as any);
      doctorRepo.save.mockResolvedValue(savedDoctor as any);

      const result = await service.create(dto);
      expect(result).toEqual(savedDoctor);
    });

    it('should throw ConflictException if licenseNumber already exists', async () => {
      const dto = {
        firstName: 'Alice',
        lastName: 'Smith',
        specialization: 'Cardiology',
        phone: '01012345678',
        licenseNumber: 'LIC123',
      };
      doctorRepo.findOne.mockResolvedValue({ id: 1 } as any);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a doctor profile if found', async () => {
      const doctor = { id: 1, firstName: 'Alice' } as any;
      doctorRepo.findOne.mockResolvedValue(doctor);

      const result = await service.findOne(1);
      expect(result).toEqual(doctor);
    });

    it('should throw NotFoundException if doctor does not exist', async () => {
      doctorRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
