import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;
  let service: jest.Mocked<AuditLogsService>;

  beforeEach(async () => {
    const mockAuditLogsService = {
      findAll: jest.fn(),
      getFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
    service = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should forward parameters to service.findAll', async () => {
      const expectedResult = { data: [], total: 0, page: 1, limit: 15, totalPages: 0 };
      service.findAll.mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(1, 15, 'search-term', 5, 'CREATE', 'patient', '2026-06-01', '2026-06-02');

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 15,
        search: 'search-term',
        userId: 5,
        action: 'CREATE',
        entityType: 'patient',
        dateFrom: '2026-06-01',
        dateTo: '2026-06-02',
      });
    });
  });

  describe('getFilters', () => {
    it('should call service.getFilters', async () => {
      const expectedResult = { actions: ['CREATE'], entityTypes: ['patient'] };
      service.getFilters.mockResolvedValue(expectedResult as any);

      const result = await controller.getFilters();

      expect(result).toEqual(expectedResult);
      expect(service.getFilters).toHaveBeenCalled();
    });
  });
});
