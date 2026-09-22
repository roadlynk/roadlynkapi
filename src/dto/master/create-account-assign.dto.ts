import { IsMongoId } from 'class-validator';

export class CreateAccountAssignDto {
  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  consignorId!: string;

  @IsMongoId()
  consignorBranchId!: string;

  @IsMongoId()
  accountId!: string;
}
