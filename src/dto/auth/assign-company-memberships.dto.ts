import {
  IsArray,
  IsMongoId,
  IsOptional,
} from 'class-validator';

export class AssignCompanyMembershipsDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  MANAGER?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  AUDITOR?: string[];
}