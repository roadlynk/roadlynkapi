import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { EmployeeRole, UserRole } from '../../common/enums/user-role.enum';

export class ChangeUserRolesDto {
  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;

  @IsOptional()
  @IsEnum(EmployeeRole, { each: true })
  employeeRoles?: EmployeeRole[];

  @IsOptional()
  @IsMongoId()
  companyId?: string;
}