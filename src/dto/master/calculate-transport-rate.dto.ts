import {
  IsDateString,
  IsMongoId,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CalculateTransportRateDto {
  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  consignorId!: string;

  @IsMongoId()
  consignorBranchId!: string;

  @IsMongoId()
  consigneeId!: string;

  @IsMongoId()
  dealerId!: string;

  @IsMongoId()
  materialId!: string;

  @IsOptional()
  @IsDateString()
  companyDate?: string;

  @IsNumber()
  @Min(0)
  truckCapacity!: number;

  @IsNumber()
  @Min(0)
  loadCapacity!: number;
}