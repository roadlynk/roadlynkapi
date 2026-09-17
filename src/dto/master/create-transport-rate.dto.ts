import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class TonnageRateDto {
  @IsNumber()
  @Min(0)
  fromLimit!: number;

  @IsNumber()
  @Min(0)
  toLimit!: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  transportRate!: number[];
}

export class CreateTransportRateDto {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TonnageRateDto)
  tonnageRate!: TonnageRateDto[];

  @IsDateString()
  effectiveFrom!: string;

  @IsMongoId()
  materialId!: string;

  @IsNumber()
  @Min(0)
  calculatedDistance!: number;

  @IsNumber()
  @Min(0)
  companyDistance!: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean = true;

}
