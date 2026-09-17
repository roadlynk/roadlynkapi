import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { errorCode } from '../common/error.index';
import { UserCompanyType, UserRole } from '../common/enums/user-role.enum';
import { ALL_ROLES_KEY, ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allRequired = this.reflector.getAllAndOverride<
      Array<UserRole | UserCompanyType>
    >(ALL_ROLES_KEY, [context.getHandler(), context.getClass()]);
    const required = this.reflector.getAllAndOverride<Array<UserRole | UserCompanyType>>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allRequired?.length && !required?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return this.forbidden();

    const userPermissions = new Set<UserRole | UserCompanyType>([
      user.userRole,
      user.userCompanyType,
    ]);

    if (allRequired?.length &&
      !allRequired.every((permission) => userPermissions.has(permission))) {
      return this.forbidden();
    }

    if (required?.length &&
      !required.some((permission) => userPermissions.has(permission))) {
      return this.forbidden();
    }

    return true;
  }

  private forbidden(): never {
    throw new ForbiddenException({
      message: 'You are not allowed to access this resource',
      error_code: errorCode.apiCommon.forbidden,
    });
  }
}
