import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { errorCode } from '../../common/error.index';
import {
  EmployeeRole,
  UserCompanyType,
  UserRole,
} from '../../common/enums/user-role.enum';
import { UserRepository } from '../../repositories/auth/user.repository';
import { ChangeUserActiveStatusDto } from '../../dto/auth/change-user-active-status.dto';
import { ChangeUserRolesDto } from '../../dto/auth/change-user-roles.dto';
import { RegisterDto } from '../../dto/auth/register.dto';
import {
  Actor,
  RegistrationAuthorizationService,
} from './authorization.service';
import { CompanyMembershipsService } from './company-memberships.service';
import { GetUsersForAdminQueryDto } from '../../dto/auth/get-users-for-admin-query.dto';
import { EditUserByAdminDto } from '../../dto/auth/edit-user-by-admin.dto';
import { User } from '../../schemas/auth-users/user.schema';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly companyMembershipsService: CompanyMembershipsService,
    private readonly authorizationService: RegistrationAuthorizationService,
  ) {}

  async findByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByIdWithPassword(id: string) {
    return this.userRepository.findByIdWithPassword(id);
  }

  async getUsersForAdmin(
    actor: Actor,
    query: GetUsersForAdminQueryDto,
  ) {
    const isProviderAdmin =
      actor.userCompanyType === UserCompanyType.PROVIDER &&
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.userRole!);

    if (isProviderAdmin) {
      const users = await this.userRepository.findProviderEmployeesAndClientAdmins(
        query.active,
      );

      return {
        employee: users.filter(
          (user) =>
            user.userCompanyType === UserCompanyType.PROVIDER &&
            user.userRole === UserRole.EMPLOYEE,
        ).map((user) => ({
          ...user,
          companies: user.companies ?? [],
        })),
        admin: users.filter(
          (user) =>
            user.userCompanyType === UserCompanyType.CLIENT &&
            user.userRole === UserRole.ADMIN,
        ).map((user) => ({
          ...user,
          companies: user.companies ?? [],
        })),
      };
    }

    if (
      actor.userCompanyType !== UserCompanyType.CLIENT ||
      actor.userRole !== UserRole.ADMIN ||
      !actor.sub ||
      !query.companyId
    ) {
      throw new BadRequestException({
        message: 'Company ID is required for client admins',
        error_code: errorCode.apiCommon.badRequest,
      });
    }

    if (!(await this.companyMembershipsService.hasActiveMembership(actor.sub, query.companyId))) {
      throw new ForbiddenException({
        message: 'You are not assigned to this company',
        error_code: errorCode.apiCommon.forbidden,
      });
    }

    const entries = await this.companyMembershipsService.getUsersForCompany(
      query.companyId,
      query.active,
    );

    return {
      employee: entries
        .filter((entry) => entry.category === 'employee')
        .map((entry) => entry.user),
      admin: entries
        .filter((entry) => entry.category === 'admin')
        .map((entry) => entry.user),
    };
  }

  async changePassword(id: string, passwordHash: string) {
    const user = await this.userRepository.updatePasswordAndIncrementTokenVersion(
      id,
      passwordHash,
    );

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error_code: errorCode.user.notFound,
      });
    }

    return user;
  }

  async editUserBasicInfo(targetUser: User, userId: string, dto: EditUserByAdminDto) {

    if (dto.email && dto.email !== targetUser.email) {
      const existing = await this.userRepository.findByEmailExcludingId(
        dto.email,
        userId,
      );

      if (existing) {
        throw new ConflictException({
          message: 'Email already exists',
          error_code: errorCode.user.duplicateUsernameOrEmail,
        });
      }
    }

    const update: Partial<{
      username: string;
      email: string;
      passwordHash: string;
    }> = {};

    if (dto.username !== undefined) {
      update.username = dto.username;
    }

    if (dto.email !== undefined) {
      update.email = dto.email;
    }

    if (dto.password) {
      update.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const user = await this.userRepository.updateBasicInfo(userId, update);

    if (!user) {
      throw new NotFoundException({
        message: 'Target user not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      tokenVersion: user.tokenVersion,
    };
  }

  async changeRoles(
    id: string,
    employeeRoles?: EmployeeRole[],
  ) {
    const user = await this.userRepository.updateRolesAndIncrementTokenVersion(
      id,
      employeeRoles,
    );

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error_code: errorCode.user.notFound,
      });
    }

    return user;
  }

  async changeActiveStatus(id: string, isActive: boolean) {
    const user =
      await this.userRepository.updateActiveStatusAndIncrementTokenVersion(
        id,
        isActive,
      );

    if (!user) {
      throw new NotFoundException({
        message: 'User not found',
        error_code: errorCode.user.notFound,
      });
    }

    return user;
  }

  async register(actor: Actor, dto: RegisterDto) {
    await this.authorizationService.isAuthorizedRole(actor, dto);

    if (
      dto.userRole === UserRole.EMPLOYEE &&
      !dto.employeeRoles?.length
    ) {
      throw new BadRequestException({
        message: 'At least one employee role is required',
        error_code: errorCode.apiCommon.badRequest,
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.createUser(
      dto.username,
      dto.email,
      passwordHash,
      dto.userCompanyType,
      dto.userRole,
      dto.employeeRoles,
    );

    if (dto.companyId) {
      const isClient =
        dto.userCompanyType === UserCompanyType.CLIENT &&
        dto.userRole === UserRole.EMPLOYEE;

      await this.companyMembershipsService.createCompanyMemberships(
        {
          userId: user._id.toString(),
          companyId: dto.companyId,
          employeeRoles: dto.employeeRoles ?? [],
        },
        isClient,
      );
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      userCompanyType: user.userCompanyType,
      userRole: user.userRole,
      employeeRoles: user.employeeRoles ?? [],
    };
  }

  async editUserByAdmin(actor: Actor, userId: string, dto: EditUserByAdminDto) {
    const targetUser = await this.findById(userId);
    if (!targetUser) {
      throw new NotFoundException({
        message: 'Target user not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    await this.authorizationService.isAuthorizedRole(actor, {
      userRole: targetUser.userRole,
      userCompanyType: targetUser.userCompanyType,
      companyId: dto.companyId,
    });

    if (
      targetUser.userRole === UserRole.ADMIN ||
      targetUser.userRole === UserRole.SUPER_ADMIN
    ) {
      return this.editUserBasicInfo(targetUser, userId, dto);
    }

    if (targetUser.userCompanyType === UserCompanyType.PROVIDER) {
      if (dto.removedRoles?.length) {
        const companies =
          await this.companyMembershipsService.getCompaniesByUserAndRoles(
            userId,
            dto.removedRoles,
          );

        if (companies.length) {
          throw new BadRequestException({
            message: `User is still assigned to the following companies with roles [${dto.removedRoles.join(
              ', ',
            )}]: ${companies.map((company) => company.companyName).join(', ')}`,
            error_code: errorCode.apiCommon.badRequest,
          });
        }
      }

      const user = await this.changeRoles(userId, dto.employeeRoles);
      return this.editUserBasicInfo(targetUser, userId, dto);
    }

    if (!dto.companyId) {
      throw new BadRequestException({
        message: 'Company ID is required',
        error_code: errorCode.apiCommon.badRequest,
      });
    }

    if (dto.removedRoles?.length) {
      await this.companyMembershipsService.deleteMembershipsByUserAndRoles(
        userId,
        dto.removedRoles,
      );
    }

    const user = await this.changeRoles(userId, dto.employeeRoles);

    await this.companyMembershipsService.addMissingRoles(
      userId,
      dto.companyId,
      dto.employeeRoles ?? [],
    );

    return this.editUserBasicInfo(targetUser, userId, dto);
  }

  async updateActiveStatus(
    actor: Actor,
    userId: string,
    dto: ChangeUserActiveStatusDto,
  ) {
    const targetUser = await this.findById(userId);
    if (!targetUser) {
      throw new NotFoundException({
        message: 'Target user not found',
        error_code: errorCode.apiCommon.notFound,
      });
    }
    await this.authorizationService.isAuthorizedRole(actor, {
      userRole: targetUser?.userRole,
      userCompanyType: targetUser?.userCompanyType,
      companyId: dto.companyId,
    });

    const user = await this.changeActiveStatus(userId, dto.isActive);

    return {
      id: user._id.toString(),
      isActive: user.isActive,
      tokenVersion: user.tokenVersion,
    };
  }

  async createUser(
    username: string,
    email: string,
    passwordHash: string,
    userCompanyType?: UserCompanyType,
    userRole?: UserRole,
    employeeRoles?: EmployeeRole[],
  ) {
    const existing = await this.userRepository.findByUsernameOrEmail(
      username,
      email,
    );

    if (existing) {
      throw new ConflictException({
        message: 'Username or email already exists',
        error_code: errorCode.user.duplicateUsernameOrEmail,
      });
    }

    return this.userRepository.create({
      username,
      email,
      passwordHash,
      userCompanyType: userCompanyType ?? UserCompanyType.CLIENT,
      userRole: userRole ?? UserRole.EMPLOYEE,
      employeeRoles: employeeRoles ?? [],
      tokenVersion: 1,
      isActive: true,
    });
  }
}
