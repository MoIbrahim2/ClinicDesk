import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log a new system or user action.
   * Wrapped in try/catch to ensure audit logging errors do not crash primary business operations.
   */
  async logAction(
    userId: number | null,
    action: string,
    entityType: string,
    entityId: number | null,
    oldValues: any,
    newValues: any,
    ipAddress?: string,
  ): Promise<AuditLog | null> {
    try {
      const log = this.auditLogRepository.create({
        userId,
        action,
        entityType,
        entityId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress: ipAddress || null,
      });
      return await this.auditLogRepository.save(log);
    } catch (error) {
      console.error('Audit logging failed:', error);
      return null;
    }
  }

  /**
   * Find paginated audit logs based on query filters.
   */
  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: number;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 15)));
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.user', 'user')
      .leftJoinAndSelect('user.role', 'role');

    if (query.userId) {
      queryBuilder.andWhere('auditLog.userId = :userId', { userId: query.userId });
    }

    if (query.action) {
      queryBuilder.andWhere('auditLog.action = :action', { action: query.action });
    }

    if (query.entityType) {
      queryBuilder.andWhere('auditLog.entityType = :entityType', { entityType: query.entityType });
    }

    if (query.dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      // Add end of day boundary if it is just a date string (YYYY-MM-DD)
      const toDate = query.dateTo.includes('T') ? query.dateTo : `${query.dateTo} 23:59:59`;
      queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo: toDate });
    }

    if (query.search) {
      const searchPattern = `%${query.search}%`;
      queryBuilder.andWhere(
        '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search OR user.firstNameAr LIKE :search OR user.lastNameAr LIKE :search OR CAST(auditLog.entityId AS CHAR) LIKE :search)',
        { search: searchPattern },
      );
    }

    queryBuilder.orderBy('auditLog.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieve distinct actions and entityTypes to populate frontend filter lists.
   */
  async getFilters() {
    const actionsRaw = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.action', 'action')
      .getRawMany();

    const entityTypesRaw = await this.auditLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.entityType', 'entityType')
      .getRawMany();

    return {
      actions: actionsRaw.map((r) => r.action).filter(Boolean),
      entityTypes: entityTypesRaw.map((r) => r.entityType).filter(Boolean),
    };
  }
}
