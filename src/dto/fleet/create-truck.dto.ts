import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Manufacturer } from '../../schemas/fleet/truck.schema';

export class CertificateValidityDto {
  @IsDateString()
  fromDate!: string;

  @IsDateString()
  toDate!: string;
}

export class CertificateDto {
  @ValidateNested()
  @Type(() => CertificateValidityDto)
  fitnessCertificate!: CertificateValidityDto;

  @ValidateNested()
  @Type(() => CertificateValidityDto)
  permitDate!: CertificateValidityDto;

  @ValidateNested()
  @Type(() => CertificateValidityDto)
  insurance!: CertificateValidityDto;

  @ValidateNested()
  @Type(() => CertificateValidityDto)
  pollutionCertificate!: CertificateValidityDto;

  @ValidateNested()
  @Type(() => CertificateValidityDto)
  taxCertificate!: CertificateValidityDto;
}

export class CreateTruckDto {
  @IsString()
  truckNumber!: string;

  @IsString()
  chasisNumber!: string;

  @IsNumber()
  capacity!: number;

  @IsNumber()
  wheelType!: number;

  @IsNumber()
  fuelTankCapacity!: number;

  @IsNumber()
  horsePower!: number;

  @IsEnum(Manufacturer)
  manufacturer!: Manufacturer;

  @IsNumber()
  manufacturingYear!: number;

  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  ownerId!: string;

  @ValidateNested()
  @Type(() => CertificateDto)
  certificate!: CertificateDto;
}
