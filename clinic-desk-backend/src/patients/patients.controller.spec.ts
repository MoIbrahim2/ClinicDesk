import { Test, TestingModule } from '@nestjs/testing';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('PatientsController', () => {
  let controller: PatientsController;
  let service: jest.Mocked<PatientsService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  beforeEach(async () => {
    const mockPatientsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      getFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatientsController],
      providers: [
        { provide: PatientsService, useValue: mockPatientsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<PatientsController>(PatientsController);
    service = module.get(PatientsService);
    auditLogsService = module.get(AuditLogsService);
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

      const result = await controller.create(dto, reqUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, 5);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        5,
        'CREATE',
        'patient',
        1,
        null,
        expectedResult,
        '127.0.0.1',
      );
    });
  });

  describe('findAll', () => {
    it('should query all patients with parameters', async () => {
      const searchOptions = { page: 1, limit: 10, search: 'John' };
      const expectedResult = { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll({ role: { name: 'admin' } } as any, 1, 10, 'John');
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
      const oldPatient = { id: 1, firstName: 'John' };
      const expectedResult = { id: 1, firstName: 'Johnny' };
      service.findOne.mockResolvedValue(oldPatient as any);
      service.update.mockResolvedValue(expectedResult as any);

      const result = await controller.update(1, dto, reqUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(1, reqUser);
      expect(service.update).toHaveBeenCalledWith(1, dto, reqUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        5,
        'UPDATE',
        'patient',
        1,
        oldPatient,
        expectedResult,
        '127.0.0.1',
      );
    });
  });

  describe('remove', () => {
    it('should delete a patient profile', async () => {
      const reqUser = { id: 5 } as User;
      const oldPatient = { id: 1, firstName: 'John' };
      service.findOne.mockResolvedValue(oldPatient as any);
      service.remove.mockResolvedValue(undefined);

      await controller.remove(1, reqUser, '127.0.0.1');
      expect(service.findOne).toHaveBeenCalledWith(1, reqUser);
      expect(service.remove).toHaveBeenCalledWith(1, reqUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        5,
        'DELETE',
        'patient',
        1,
        oldPatient,
        null,
        '127.0.0.1',
      );
    });
  });
});
