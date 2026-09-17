import { applyDecorators, SetMetadata, UseInterceptors } from '@nestjs/common';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import {
  AUDIT_LOG_OPTIONS_KEY,
  AuditLogOptions,
} from '../common/audit-log.options';

export const AuditLog = (options: AuditLogOptions) =>
  applyDecorators(
    SetMetadata(AUDIT_LOG_OPTIONS_KEY, options),
    UseInterceptors(AuditLogInterceptor),
  );