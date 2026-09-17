import { SetMetadata } from '@nestjs/common';
import { UserCompanyType, UserRole } from '../common/enums/user-role.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: Array<UserRole | UserCompanyType>) =>
  SetMetadata(ROLES_KEY, roles);

export const ALL_ROLES_KEY = 'all_roles';

export const RequireAllRoles = (...roles: Array<UserRole | UserCompanyType>) =>
  SetMetadata(ALL_ROLES_KEY, roles);
