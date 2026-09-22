import {
  IsArray,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EmployeeRole } from '../../common/enums/user-role.enum';

export class EditUserByAdminDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EmployeeRole, { each: true })
  employeeRoles?: EmployeeRole[];

  @IsOptional()
  @IsArray()
  @IsEnum(EmployeeRole, { each: true })
  removedRoles?: EmployeeRole[];

  @IsOptional()
  @IsMongoId()
  companyId?: string;
}