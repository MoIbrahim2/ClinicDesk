import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent, RemoveEvent } from 'typeorm';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { AuditLog } from './entities/audit-log.entity';

@EventSubscriber()
@Injectable()
export class AuditLogSubscriber implements EntitySubscriberInterface<AuditLog> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return AuditLog;
  }

  beforeUpdate(event: UpdateEvent<AuditLog>) {
    throw new ForbiddenException('Audit logs are append-only and cannot be updated.');
  }

  beforeRemove(event: RemoveEvent<AuditLog>) {
    throw new ForbiddenException('Audit logs are append-only and cannot be removed.');
  }
}
