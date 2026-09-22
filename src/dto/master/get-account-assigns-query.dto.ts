import { IsMongoId, IsOptional } from 'class-validator';

export class GetAccountAssignsQueryDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsMongoId()
  consignorId?: string;

  @IsOptional()
  @IsMongoId()
  consignorBranchId?: string;

  @IsOptional()
  @IsMongoId()
  accountId?: string;
}
