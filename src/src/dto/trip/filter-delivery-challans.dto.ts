import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MaterialDetailsFilterDto {
  @IsOptional()
  @IsMongoId()
  materialId?: string;

  @IsOptional()
  @IsString()
  deliveryCategory?: string;

  @IsOptional()
  @IsObject()
  dynamicFields?: Record<string, unknown>;
}

export class CompanyDetailsFilterDto {
  @IsOptional()
  @IsString()
  invoice?: string;

  @IsOptional()
  @IsString()
  shipmentNumber?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class ConsignmentFilterDto {
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
  consigneeBranchId?: string;
}

export class DealerDetailsFilterDto {
  @IsOptional()
  @IsMongoId()
  invoiceDealerId?: string;

  @IsOptional()
  @IsMongoId()
  shipToDealerId?: string;
}

export class TruckDetailsFilterDto {
  @IsOptional()
  @IsMongoId()
  truckId?: string;

  @IsOptional()
  @IsMongoId()
  driverId?: string;
}

export class FilterDeliveryChallansDto {
  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDetailsFilterDto)
  companyDetails?: CompanyDetailsFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConsignmentFilterDto)
  consignment?: ConsignmentFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DealerDetailsFilterDto)
  dealerDetails?: DealerDetailsFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MaterialDetailsFilterDto)
  material?: MaterialDetailsFilterDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TruckDetailsFilterDto)
  truckDetails?: TruckDetailsFilterDto;

  @IsOptional()
  @IsDateString()
  dcDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dcDateTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
