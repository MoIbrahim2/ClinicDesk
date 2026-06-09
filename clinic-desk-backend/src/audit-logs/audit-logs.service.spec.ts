import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let repo: jest.Mocked<Repository<AuditLog>>;
  let mockQueryBuilder: any;

  beforeEach(async () => {
    mockQueryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getRawMany: jest.fn(),
    };

    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: getRepositoryToken(AuditLog), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
    repo = module.get(getRepositoryToken(AuditLog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logAction', () => {
    it('should successfully create and save a log entry', async () => {
      const mockLog = { id: 1, action: 'CREATE' };
      repo.create.mockReturnValue(mockLog as any);
      repo.save.mockResolvedValue(mockLog as any);

      const result = await service.logAction(
        2,
        'CREATE',
        'patient',
        5,
        { name: 'old' },
        { name: 'new' },
        '127.0.0.1'
      );

      expect(repo.create).toHaveBeenCalledWith({
        userId: 2,
        action: 'CREATE',
        entityType: 'patient',
        entityId: 5,
        oldValues: { name: 'old' },
        newValues: { name: 'new' },
        ipAddress: '127.0.0.1',
      });
      expect(repo.save).toHaveBeenCalledWith(mockLog);
      expect(result).toEqual(mockLog);
    });

    it('should catch error and return null if logging fails', async () => {
      repo.create.mockImplementation(() => {
        throw new Error('Database connection lost');
      });

      const result = await service.logAction(
        2,
        'CREATE',
        'patient',
        5,
        null,
        null,
        '127.0.0.1'
      );

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should execute build query with correct parameters and pagination', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll({
        page: 2,
        limit: 10,
        action: 'UPDATE',
        entityType: 'visit',
        search: 'test',
        dateFrom: '2026-06-01',
        dateTo: '2026-06-10',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.action = :action', { action: 'UPDATE' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.entityType = :entityType', { entityType: 'visit' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.createdAt >= :dateFrom', { dateFrom: '2026-06-01' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('auditLog.createdAt <= :dateTo', { dateTo: '2026-06-10 23:59:59' });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 2,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('getFilters', () => {
    it('should return mapped distinct action and entityType lists', async () => {
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ action: 'CREATE' }, { action: 'UPDATE' }])
        .mockResolvedValueOnce([{ entityType: 'patient' }, { entityType: 'visit' }]);

      const result = await service.getFilters();

      expect(result).toEqual({
        actions: ['CREATE', 'UPDATE'],
        entityTypes: ['patient', 'visit'],
      });
    });
  });
});
