import {
  IsEmail,
  IsDefined,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  EmployeeRole,
  UserCompanyType,
  UserRole,
} from '../../common/enums/user-role.enum';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @IsDefined()
  @IsEnum(UserCompanyType)
  userCompanyType!: UserCompanyType;

  @IsDefined()
  @IsEnum(UserRole)
  userRole!: UserRole;

  @IsOptional()
  @IsEnum(EmployeeRole, { each: true })
  employeeRoles?: EmployeeRole[];

  @IsOptional()
  @IsMongoId()
  companyId?: string;
}