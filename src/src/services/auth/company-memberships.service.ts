import { ForbiddenException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { errorCode } from '../../common/error.index';
import {
  EmployeeRole,
  UserCompanyType,
  UserRole,
} from '../../common/enums/user-role.enum';
import { CreateCompanyMembershipsDto } from '../../dto/auth/create-company-memberships.dto';
import { AssignCompanyMembershipsDto } from '../../dto/auth/assign-company-memberships.dto';
import { CompanyMembershipRepository } from '../../repositories/company-membership.repository';
import { UserRepository } from '../../repositories/auth/user.repository';

@Injectable()
export class CompanyMembershipsService {
  constructor(
    private readonly companyMembershipRepository: CompanyMembershipRepository,
    private readonly userRepository: UserRepository,
  ) {}

  getUserCompanyMemberships(userId: string) {
    return this.companyMembershipRepository.findActiveUniqueCompaniesByUserId(
      userId,
    );
  }

  getUserCompaniesPaginated(userId: string, page: number, limit: number) {
    return this.companyMembershipRepository.findActiveUniqueCompaniesPaginated(
      userId,
      page,
      limit,
    );
  }

  getUsersForCompany(companyId: string, isActive: boolean) {
    return this.companyMembershipRepository.findUsersForCompany(
      companyId,
      isActive,
    );
  }

  async getAssignedUsers(companyId: string) {
    const [users, assignedUsers] = await Promise.all([
      this.userRepository.findProviderEmployees(),
      this.companyMembershipRepository.findAssignedUsersByCompanyId(companyId),
    ]);

    return {
      users: this.groupProviderEmployeesByRole(users),
      assignedUsers: this.groupUserIdsByRole(assignedUsers),
    };
  }

  private groupProviderEmployeesByRole(
    users: any[],
  ) {
    const grouped = {} as Record<EmployeeRole, Record<string, unknown>[]>;

    for (const role of Object.values(EmployeeRole)) {
      grouped[role] = [];
    }

    for (const user of users) {
      for (const role of user.employeeRoles ?? []) {
        grouped[role].push(user);
      }
    }

    return grouped;
  }

  private groupUserIdsByRole(
    entries: Array<{ employeeRole: EmployeeRole; userId: Types.ObjectId }>,
  ) {
    const grouped = {} as Record<EmployeeRole, string[]>;

    for (const role of Object.values(EmployeeRole)) {
      grouped[role] = [];
    }

    for (const entry of entries) {
      grouped[entry.employeeRole].push(entry.userId.toString());
    }

    return grouped;
  }

  async assignUsersToCompany(
    actor: {
      sub?: string;
      userCompanyType?: UserCompanyType;
      userRole?: UserRole;
    },
    dto: AssignCompanyMembershipsDto,
  ) {
    const isProviderAdmin =
      actor.userCompanyType === UserCompanyType.PROVIDER &&
      actor.userRole === UserRole.ADMIN;

    if (!isProviderAdmin) {
      throw new ForbiddenException({
        message: 'Only provider admins can assign company users',
        error_code: errorCode.apiCommon.forbidden,
      });
    }

    const uniqueAssignments = Object.values(EmployeeRole).flatMap(
      (employeeRole) =>
        [...new Set(dto[employeeRole] ?? [])].map((userId) => ({
          userId,
          employeeRole,
        })),
    );

    const result = await this.companyMembershipRepository.syncUsersToCompany(
      dto.companyId,
      uniqueAssignments,
    );

    return {
      processed: uniqueAssignments.length,
      deleted: result.deleted,
      created: result.created,
    };
  }

  async hasActiveMembership(
    userId: string,
    companyId: string,
    employeeRole?: EmployeeRole,
  ) {
    return Boolean(
      await this.companyMembershipRepository.hasActiveMembership(
        userId,
        companyId,
        employeeRole,
      ),
    );
  }

  getCompaniesByUserAndRoles(
    userId: string,
    employeeRoles: EmployeeRole[],
  ) {
    return this.companyMembershipRepository.findUniqueCompaniesByUserAndRoles(
      userId,
      employeeRoles,
    );
  }

  deleteMembershipsByUserAndRoles(
    userId: string,
    employeeRoles: EmployeeRole[],
  ) {
    return this.companyMembershipRepository.deleteByUserAndRoles(
      userId,
      employeeRoles,
    );
  }

  addMissingRoles(
    userId: string,
    companyId: string,
    employeeRoles: EmployeeRole[],
  ) {
    return this.companyMembershipRepository.addMissingRoles(
      userId,
      companyId,
      employeeRoles,
    );
  }

  createCompanyMemberships(
    dto: CreateCompanyMembershipsDto,
    isClient = false,
  ) {
    const userId = new Types.ObjectId(dto.userId);
    const companyId = new Types.ObjectId(dto.companyId);
    const employeeRoles = dto.employeeRoles?.length ? dto.employeeRoles : [undefined];
    const memberships = employeeRoles.map((employeeRole) => ({
      userId,
      companyId,
      employeeRole,
      isActive: true,
      isClient,
    }));

    return this.companyMembershipRepository.createMany(memberships);
  }
}