import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let service: jest.Mocked<AppointmentsService>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockAdminUser = { id: 1, email: 'admin@test.com', role: { name: 'admin' } } as User;

  beforeEach(async () => {
    const mockAppointmentsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
    };

    const mockAuditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
      findAll: jest.fn(),
      getFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        { provide: AppointmentsService, useValue: mockAppointmentsService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
    service = module.get(AppointmentsService);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should schedule an appointment', async () => {
      const dto: CreateAppointmentDto = {
        patientId: 1,
        doctorId: 1,
        date: '2026-06-15',
        startTime: '09:00',
        endTime: '09:30',
      };
      const expectedResult = { id: 1, ...dto };
      service.create.mockResolvedValue(expectedResult as any);

      const result = await controller.create(dto, mockAdminUser, '127.0.0.1');
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(dto, mockAdminUser);
      expect(auditLogsService.logAction).toHaveBeenCalledWith(
        mockAdminUser.id,
        'CREATE',
        'appointment',
        expectedResult.id,
        null,
        expectedResult,
        '127.0.0.1',
      );
    });
  });
});
