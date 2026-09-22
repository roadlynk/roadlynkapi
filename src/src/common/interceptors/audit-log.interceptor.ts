import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Observable, catchError, tap, throwError } from 'rxjs';
import {
  AUDIT_LOG_OPTIONS_KEY,
  AuditLogOptions,
} from '../audit-log.options';
import { AuditLogService } from '../../services/audit-log.service';
import { UsersService } from '../../services/auth/users.service';

const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'refreshToken',
  'accessToken',
  'authorization',
]);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
    private readonly usersService: UsersService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_OPTIONS_KEY,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((responseBody) => {
        void this.writeAuditLog(
          request,
          options,
          response.statusCode,
          responseBody,
        );
      }),
      catchError((error: unknown) => {
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;
        const responseBody =
          error instanceof HttpException ? error.getResponse() : undefined;

        void this.writeAuditLog(
          request,
          options,
          statusCode,
          responseBody,
        );

        return throwError(() => error);
      }),
    );
  }

  private async writeAuditLog(
    request: Request,
    options: AuditLogOptions,
    statusCode: number,
    responseBody: unknown,
  ) {
    try {
      const actor = (request as Request & { user?: { sub?: string } }).user;
      const actorId = actor?.sub;
      const user =
        actorId && Types.ObjectId.isValid(actorId)
          ? await this.usersService.findById(actorId)
          : null;

      await this.auditLogService.create({
        action: options.action,
        actor: user
          ? {
              id: new Types.ObjectId(actorId),
              name: user.username ?? '',
              email: user.email ?? '',
            }
          : undefined,
        resource: this.getResource(
          request,
          responseBody,
          options.resourceType,
        ),
        request: {
          method: request.method,
          path: request.originalUrl,
          body: this.sanitizeBody(request.body),
        },
        result: {
          status: statusCode < 400 ? 'SUCCESS' : 'FAILURE',
          code: statusCode,
          errorCode:
            statusCode >= 400 ? this.getErrorCode(responseBody) : undefined,
        },
      });
    } catch {
      // Audit persistence must not change the endpoint response.
    }
  }

  private getResource(
    request: Request,
    responseBody: unknown,
    resourceType: string,
  ) {
    const responseId =
      responseBody && typeof responseBody === 'object'
        ? (responseBody as { id?: unknown }).id
        : undefined;
    const pathId = request.path
      .split('/')
      .find((segment) => Types.ObjectId.isValid(segment));
    const resourceId =
      typeof responseId === 'string' && Types.ObjectId.isValid(responseId)
        ? responseId
        : pathId;

    return resourceId
      ? { type: resourceType, id: new Types.ObjectId(resourceId) }
      : { type: resourceType };
  }

  private getErrorCode(responseBody: unknown) {
    if (!responseBody || typeof responseBody !== 'object') {
      return undefined;
    }

    const errorCode = (responseBody as { error_code?: unknown }).error_code;
    return typeof errorCode === 'string' ? errorCode : undefined;
  }

  private sanitizeBody(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(body as Record<string, unknown>).map(([key, value]) => [
        key,
        SENSITIVE_FIELDS.has(key) ? '[REDACTED]' : value,
      ]),
    );
  }
}