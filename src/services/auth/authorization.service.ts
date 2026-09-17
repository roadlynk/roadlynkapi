import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { errorCode } from '../../common/error.index';
import {
  EmployeeRole,
  UserCompanyType,
  UserRole,
} from '../../common/enums/user-role.enum';
import { CompanyMembershipsService } from './company-memberships.service';

export interface Actor {
  sub?: string;
  userCompanyType?: UserCompanyType;
  userRole?: UserRole;
}

export interface Target {
  companyId?: string;
  userCompanyType?: UserCompanyType;
  userRole?: UserRole;
}

@Injectable()
export class RegistrationAuthorizationService {
  constructor(
    private readonly companyMembershipsService: CompanyMembershipsService,
  ) {}

  async isAuthorizedRole(actor: Actor, target: Target) {
    if (target.userCompanyType === UserCompanyType.CLIENT && !target.companyId) {
      throw new BadRequestException({
        message: 'Company ID is required for client users',
        error_code: errorCode.apiCommon.badRequest,
      });
    }
    if(actor.userCompanyType === UserCompanyType.PROVIDER && actor.userRole === UserRole.SUPER_ADMIN) {
      return true;
    }
    if (actor.userCompanyType === UserCompanyType.PROVIDER && actor.userRole === UserRole.ADMIN) {
      if (
        target.userCompanyType === UserCompanyType.PROVIDER &&
        (target.userRole === UserRole.SUPER_ADMIN ||
        target.userRole === UserRole.ADMIN)
      ) {
        return this.forbidden();
      }

      return true;
    }

    const isClientAdmin =
      actor.userCompanyType === UserCompanyType.CLIENT &&
      actor.userRole === UserRole.ADMIN;

    if (
      !isClientAdmin ||
      target.userCompanyType !== UserCompanyType.CLIENT ||
      !target.companyId ||
      !actor.sub
    ) {
      return this.forbidden();
    }

    const hasActiveMembership = await this.companyMembershipsService.hasActiveMembership(
      actor.sub,
      target.companyId,
    );

    return hasActiveMembership ? true : this.forbidden();
  }

  async isAuthorisedtoAccessCompany(
    actor: Actor,
    companyId: string,
    employeeRole?: EmployeeRole,
    isAdmin = false,
  ) {
    if (
      isAdmin &&
      (actor.userCompanyType !== UserCompanyType.PROVIDER ||
        (actor.userRole !== UserRole.ADMIN &&
          actor.userRole !== UserRole.SUPER_ADMIN))
    ) {
      return this.forbidden();
    }

    if (
      actor.userCompanyType === UserCompanyType.PROVIDER &&
      (actor.userRole === UserRole.ADMIN ||
        actor.userRole === UserRole.SUPER_ADMIN)
    ) {
      return true;
    }

    if (!actor.sub) {
      return this.forbidden();
    }

    if (actor.userRole === UserRole.ADMIN) {
      const hasActiveMembership = await this.companyMembershipsService.hasActiveMembership(
        actor.sub,
        companyId,
      );

      return hasActiveMembership ? true : this.forbidden();
    }

    const hasActiveMembership = await this.companyMembershipsService.hasActiveMembership(
      actor.sub,
      companyId,
      employeeRole,
    );

    return hasActiveMembership ? true : this.forbidden();
  }

  private forbidden(): never {
    throw new ForbiddenException({
      message: 'You are not allowed to access this resource',
      error_code: errorCode.apiCommon.forbidden,
    });
  }
}