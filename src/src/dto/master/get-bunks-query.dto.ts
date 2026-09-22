import { IsMongoId, IsOptional } from 'class-validator';

export class GetBunksQueryDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsMongoId()
  consignorId?: string;

  @IsOptional()
  @IsMongoId()
  consignorBranchId?: string;
}
