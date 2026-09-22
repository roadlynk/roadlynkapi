import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { AuditLog, AuditLogSchema } from '../schemas/audit-log.schema';
import { AuditLogService } from '../services/audit-log.service';
import { UsersModule } from './auth/users.module';

@Global()
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  providers: [AuditLogRepository, AuditLogService, AuditLogInterceptor],
  exports: [AuditLogService, AuditLogInterceptor],
})
export class AuditLogModule {}