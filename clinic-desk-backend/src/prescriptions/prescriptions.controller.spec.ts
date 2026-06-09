import { Test, TestingModule } from '@nestjs/testing';
import { PrescriptionsController } from './prescriptions.controller';
import { PrescriptionsService } from './prescriptions.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { User } from '../users/entities/user.entity';

describe('PrescriptionsController', () => {
  let controller: PrescriptionsController;
  let service: jest.Mocked<PrescriptionsService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockUser = { id: 2, role: { name: 'doctor' } } as User;

  beforeEach(async () => {
    const mockPrescriptionsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      duplicate: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrescriptionsController],
      providers: [
        { provide: PrescriptionsService, useValue: mockPrescriptionsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<PrescriptionsController>(PrescriptionsController);
    service = module.get(PrescriptionsService);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create prescription and record audit log', async () => {
      const dto: CreatePrescriptionDto = { visitId: 10, items: [] };
      const createdPresc = { id: 50, visitId: 10 } as any;
      service.create.mockResolvedValue(createdPresc);

      const result = await controller.create(dto, mockUser, '127.0.0.1');
      expect(result).toEqual(createdPresc);
      expect(service.create).toHaveBeenCalledWith(dto, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'CREATE',
        'prescription',
        50,
        null,
        createdPresc,
        '127.0.0.1',
      );
    });
  });

  describe('update', () => {
    it('should update prescription, record audit log with old value', async () => {
      const dto: UpdatePrescriptionDto = { notes: 'New notes' };
      const oldPresc = { id: 50, notes: 'Old notes' } as any;
      const updatedPresc = { id: 50, notes: 'New notes' } as any;
      service.findOne.mockResolvedValue(oldPresc);
      service.update.mockResolvedValue(updatedPresc);

      const result = await controller.update(50, dto, mockUser, '127.0.0.1');
      expect(result).toEqual(updatedPresc);
      expect(service.update).toHaveBeenCalledWith(50, dto, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'UPDATE',
        'prescription',
        50,
        oldPresc,
        updatedPresc,
        '127.0.0.1',
      );
    });
  });

  describe('remove', () => {
    it('should delete prescription and record audit log', async () => {
      const oldPresc = { id: 50, notes: 'Old notes' } as any;
      service.findOne.mockResolvedValue(oldPresc);
      service.remove.mockResolvedValue(undefined);

      await controller.remove(50, mockUser, '127.0.0.1');
      expect(service.remove).toHaveBeenCalledWith(50, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'DELETE',
        'prescription',
        50,
        oldPresc,
        null,
        '127.0.0.1',
      );
    });
  });

  describe('duplicate', () => {
    it('should clone prescription and record audit log', async () => {
      const duplicated = { id: 51, visitId: 11 } as any;
      service.duplicate.mockResolvedValue(duplicated);

      const result = await controller.duplicate(50, 11, mockUser, '127.0.0.1');
      expect(result).toEqual(duplicated);
      expect(service.duplicate).toHaveBeenCalledWith(50, 11, mockUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockUser.id,
        'CREATE',
        'prescription',
        51,
        null,
        duplicated,
        '127.0.0.1',
      );
    });
  });
});
