import { Test, TestingModule } from '@nestjs/testing';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('VisitsController', () => {
  let controller: VisitsController;
  let service: jest.Mocked<VisitsService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockAdminUser = { id: 1, email: 'admin@test.com', role: { name: 'admin' } } as User;

  beforeEach(async () => {
    const mockVisitsService = {
      create: jest.fn(),
      updateDraft: jest.fn(),
      finalize: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      getPatientTimeline: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      getFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController],
      providers: [
        { provide: VisitsService, useValue: mockVisitsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<VisitsController>(VisitsController);
    service = module.get(VisitsService);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should start a new visit record', async () => {
      const dto: CreateVisitDto = {
        appointmentId: 1,
        chiefComplaint: 'Chest pain',
      };
      const expectedResult = { id: 10, ...dto };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto, mockAdminUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, mockAdminUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockAdminUser.id,
        'CREATE',
        'visit',
        expectedResult.id,
        null,
        expectedResult,
        '127.0.0.1',
      );
    });
  });

  describe('update', () => {
    it('should save draft details of a visit', async () => {
      const dto: UpdateVisitDto = {
        chiefComplaint: 'Updated chest pain',
        examinationNotes: 'Patient lungs clear',
      };
      const oldVisit = { id: 10, chiefComplaint: 'Chest pain' };
      const expectedResult = { id: 10, ...dto };
      service.findOne.mockResolvedValue(oldVisit as any);
      service.updateDraft.mockResolvedValue(expectedResult as any);

      const result = await controller.update(10, dto, mockAdminUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(10, mockAdminUser);
      expect(service.updateDraft).toHaveBeenCalledWith(10, dto, mockAdminUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockAdminUser.id,
        'UPDATE',
        'visit',
        10,
        oldVisit,
        expectedResult,
        '127.0.0.1',
      );
    });
  });

  describe('finalize', () => {
    it('should complete visit documentation', async () => {
      const oldVisit = { id: 10, status: 'draft' };
      const expectedResult = { id: 10, status: 'completed' };
      service.findOne.mockResolvedValue(oldVisit as any);
      service.finalize.mockResolvedValue(expectedResult as any);

      const result = await controller.finalize(10, mockAdminUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(10, mockAdminUser);
      expect(service.finalize).toHaveBeenCalledWith(10, mockAdminUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockAdminUser.id,
        'FINALIZE',
        'visit',
        10,
        oldVisit,
        expectedResult,
        '127.0.0.1',
      );
    });
  });
});
