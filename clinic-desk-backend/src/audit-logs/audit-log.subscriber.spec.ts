import { DataSource, UpdateEvent, RemoveEvent } from 'typeorm';
import { AuditLogSubscriber } from './audit-log.subscriber';
import { AuditLog } from './entities/audit-log.entity';
import { ForbiddenException } from '@nestjs/common';

describe('AuditLogSubscriber', () => {
  let subscriber: AuditLogSubscriber;
  let mockDataSource: jest.Mocked<DataSource>;

  beforeEach(() => {
    mockDataSource = {
      subscribers: [],
    } as unknown as jest.Mocked<DataSource>;

    subscriber = new AuditLogSubscriber(mockDataSource);
  });

  it('should register itself in the DataSource subscribers array', () => {
    expect(mockDataSource.subscribers).toContain(subscriber);
  });

  it('should listen to AuditLog entity', () => {
    expect(subscriber.listenTo()).toBe(AuditLog);
  });

  it('should throw ForbiddenException in beforeUpdate', () => {
    const mockEvent = {} as UpdateEvent<AuditLog>;
    expect(() => subscriber.beforeUpdate(mockEvent)).toThrow(ForbiddenException);
    expect(() => subscriber.beforeUpdate(mockEvent)).toThrow(
      'Audit logs are append-only and cannot be updated.'
    );
  });

  it('should throw ForbiddenException in beforeRemove', () => {
    const mockEvent = {} as RemoveEvent<AuditLog>;
    expect(() => subscriber.beforeRemove(mockEvent)).toThrow(ForbiddenException);
    expect(() => subscriber.beforeRemove(mockEvent)).toThrow(
      'Audit logs are append-only and cannot be removed.'
    );
  });
});
