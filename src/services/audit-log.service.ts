import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog } from '../schemas/audit-log.schema';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  create(auditLog: Partial<AuditLog>) {
    return this.auditLogRepository.create(auditLog);
  }
}