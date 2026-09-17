import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateCompanyAddressDto {
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

export class CreateCompanyDto {
  @IsString()
  companyCode!: string;

  @IsString()
  companyName!: string;

  @IsEmail()
  contactEmail!: string;

  @IsString()
  contactNumber!: string;

  @IsString()
  gstin!: string;

  @IsString()
  pan!: string;

  @ValidateNested()
  @Type(() => CreateCompanyAddressDto)
  address!: CreateCompanyAddressDto;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isSaasClient?: boolean;
}