import { IsMongoId } from 'class-validator';

export class CompanyUsersParamDto {
  @IsMongoId()
  companyId!: string;
}