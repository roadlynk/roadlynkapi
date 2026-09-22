import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  AdditionalInformationDto,
  AdvanceDetailsDto,
  CompanyDetailsDto,
  ConsignmentDto,
  DealerDetailsDto,
  DistanceDetailsDto,
  MaterialDetailsDto,
  RateDetailsDto,
  TruckDetailsDto,
} from './create-delivery-challan.dto';

export class UpdateDeliveryChallanDto {
  @IsOptional()
  @IsDateString()
  dcDate?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CompanyDetailsDto)
  companyDetails?: CompanyDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConsignmentDto)
  consignment?: ConsignmentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TruckDetailsDto)
  truckDetails?: TruckDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DealerDetailsDto)
  dealerDetails?: DealerDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MaterialDetailsDto)
  material?: MaterialDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RateDetailsDto)
  rate?: RateDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DistanceDetailsDto)
  distance?: DistanceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdvanceDetailsDto)
  advance?: AdvanceDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalInformationDto)
  additionalInformation?: AdditionalInformationDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}