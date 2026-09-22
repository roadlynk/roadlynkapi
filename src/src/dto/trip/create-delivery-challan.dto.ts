import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompanyDetailsDto {
  @IsString()
  invoice!: string;

  @IsString()
  shipmentNumber!: string;

  @IsDateString()
  date!: string;
}

export class ConsignmentDto {
  @IsMongoId()
  consignorId!: string;

  @IsMongoId()
  consignorBranchId!: string;

  @IsMongoId()
  consigneeId!: string;

  @IsMongoId()
  consigneeBranchId!: string;

  @IsOptional()
  @IsString()
  bunkName?: string;

  @IsOptional()
  @IsString()
  account?: string;
}

export class DealerDetailsDto {
  @IsMongoId()
  invoiceDealerId!: string;

  @IsMongoId()
  shipToDealerId!: string;

  @IsOptional()
  @IsBoolean()
  isSame?: boolean;
}

export class MaterialDetailsDto {
  @IsMongoId()
  materialId!: string;

  @IsString()
  deliveryCategory!: string;

  @IsNumber()
  @Min(0)
  loadingQuantity!: number;

  @IsOptional()
  @IsObject()
  dynamicFields?: Record<string, unknown>;
}

export class RateDetailsDto {
  @IsNumber()
  @Min(0)
  transportRate!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  transportIncentive?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  biddingAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTransportRate?: number;
}

export class DistanceDetailsDto {
  @IsString()
  odomenterImageUrl!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  odometerDistance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  calculatedDistance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  companyDistance?: number;
}

export class AdvanceDetailsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  cashAdvance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dieselAdvance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bankAdvance?: number;

  @IsOptional()
  @IsBoolean()
  isPaymentDone?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAdvance?: number;
}

export class AdditionalInformationDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TruckDetailsDto {
  @IsMongoId()
  truckId!: string;

  @IsMongoId()
  driverId!: string;
}

export class CreateDeliveryChallanDto {
  @IsMongoId()
  companyId!: string;

  @ValidateNested()
  @Type(() => CompanyDetailsDto)
  companyDetails!: CompanyDetailsDto;

  @ValidateNested()
  @Type(() => ConsignmentDto)
  consignment!: ConsignmentDto;

  @ValidateNested()
  @Type(() => TruckDetailsDto)
  truckDetails!: TruckDetailsDto;

  @ValidateNested()
  @Type(() => DealerDetailsDto)
  dealerDetails!: DealerDetailsDto;

  @ValidateNested()
  @Type(() => MaterialDetailsDto)
  material!: MaterialDetailsDto;

  @ValidateNested()
  @Type(() => RateDetailsDto)
  rate!: RateDetailsDto;

  @ValidateNested()
  @Type(() => DistanceDetailsDto)
  distance!: DistanceDetailsDto;

  @ValidateNested()
  @Type(() => AdvanceDetailsDto)
  advance!: AdvanceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalInformationDto)
  additionalInformation?: AdditionalInformationDto;
}
