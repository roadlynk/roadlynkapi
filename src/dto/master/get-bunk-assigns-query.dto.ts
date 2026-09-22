import { IsMongoId, IsOptional } from 'class-validator';

export class GetBunkAssignsQueryDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsMongoId()
  consignorId?: string;

  @IsOptional()
  @IsMongoId()
  consignorBranchId?: string;
}
