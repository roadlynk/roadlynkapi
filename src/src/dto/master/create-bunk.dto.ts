import { IsArray, IsMongoId, IsString } from 'class-validator';

export class CreateBunkDto {
  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  consignorId!: string;

  @IsMongoId()
  consignorBranchId!: string;

  @IsArray()
  @IsString({ each: true })
  bunkName!: string[];
}
