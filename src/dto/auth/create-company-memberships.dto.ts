import { IsArray, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { EmployeeRole } from '../../common/enums/user-role.enum';

export class CreateCompanyMembershipsDto {
  @IsMongoId()
  userId!: string;

  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EmployeeRole, { each: true })
  employeeRoles!: EmployeeRole[];
}