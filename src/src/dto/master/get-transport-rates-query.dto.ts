import { IsBoolean, IsMongoId, IsOptional } from 'class-validator';

export class GetTransportRatesQueryDto {
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
  consigneeId?: string;

  @IsOptional()
  @IsMongoId()
  dealerId?: string;

  @IsOptional()
  @IsMongoId()
  materialId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
