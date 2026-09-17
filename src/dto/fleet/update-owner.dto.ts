import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AccountGroup,
  OpeningBalanceType,
} from '../../schemas/fleet/owner.schema';

class UpdateOwnerAddressDto {
  @IsString()
  pincode!: string;

  @IsString()
  state!: string;

  @IsString()
  district!: string;

  @IsString()
  town!: string;

  @IsString()
  fullAddress!: string;
}

export class UpdateOwnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateOwnerAddressDto)
  address?: UpdateOwnerAddressDto;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  gstin?: string;

  @IsOptional()
  @IsBoolean()
  isRental?: boolean;

  @IsOptional()
  @IsEnum(AccountGroup)
  accountGroup?: AccountGroup;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @IsOptional()
  @IsEnum(OpeningBalanceType)
  openingBalanceType?: OpeningBalanceType;

  @IsOptional()
  @IsString()
  tdsCertificateUrl?: string;

  @IsOptional()
  @IsString({ each: true })
  tdsTruckNumber?: string[];

  @IsOptional()
  @IsNumber()
  tdsPercentage?: number;
}
