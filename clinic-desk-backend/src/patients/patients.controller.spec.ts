import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from '../users/entities/user.entity';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: jest.Mocked<PatientsService>;

  beforeEach(async () => {
    const mockPatientsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: mockPatientsService },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get(PatientsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient with creator ID', async () => {
      const dto: CreatePatientDto = {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phone: '0123456789',
      };
      const reqUser = { id: 5 } as User;
      const expectedResult = { id: 1, ...dto, createdBy: 5 };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto, reqUser);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, 5);
    });
  });

  describe('findAll', () => {
    it('should query all patients with parameters', async () => {
      const searchOptions = { page: 1, limit: 10, search: 'John' };
      const expectedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(1, 10, 'John');
      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'John',
        gender: undefined,
        bloodType: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve a patient profile', async () => {
      const reqUser = { id: 5 } as User;
      const expectedResult = { id: 1, firstName: 'John' };
      service.findOne.mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(1, reqUser);
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1, reqUser);
    });
  });

  describe('update', () => {
    it('should update patient profile', async () => {
      const dto: UpdatePatientDto = { firstName: 'Johnny' };
      const reqUser = { id: 5 } as User;
      const expectedResult = { id: 1, firstName: 'Johnny' };
      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, dto, reqUser);
      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(1, dto, reqUser);
    });
  });

  describe('remove', () => {
    it('should delete a patient profile', async () => {
      const reqUser = { id: 5 } as User;
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1, reqUser);
      expect(service.remove).toHaveBeenCalledWith(1, reqUser);
    });
  });
});
