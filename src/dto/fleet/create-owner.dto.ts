import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  AccountGroup,
  OpeningBalanceType,
} from '../../schemas/fleet/owner.schema';

class CreateOwnerAddressDto {
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

export class CreateOwnerDto {
  @IsString()
  name!: string;

  @IsString()
  phoneNumber!: string;

  @IsEmail()
  email!: string;

  @IsString()
  aadharNumber!: string;

  @ValidateNested()
  @Type(() => CreateOwnerAddressDto)
  address!: CreateOwnerAddressDto;

  @IsMongoId()
  companyId!: string;

  @IsString()
  panNumber!: string;

  @IsString()
  gstin!: string;

  @IsOptional()
  @IsBoolean()
  isRental?: boolean;

  @IsEnum(AccountGroup)
  accountGroup!: AccountGroup;

  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @IsEnum(OpeningBalanceType)
  openingBalanceType!: OpeningBalanceType;

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
