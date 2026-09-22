import { IsMongoId } from 'class-validator';

export class CreateBunkAssignDto {
  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  consignorId!: string;

  @IsMongoId()
  consignorBranchId!: string;

  @IsMongoId()
  bunkId?: string;
}
