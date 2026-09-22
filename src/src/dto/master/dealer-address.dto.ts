import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AddressType } from '../../common/enums/address-type.enum';

class PincodeAddressDto {
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

class CoordinatesAddressDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  fullAddress!: string;
}

export class DealerAddressDto {
  @IsEnum(AddressType)
  type!: AddressType;

  @ValidateIf((dto: DealerAddressDto) => dto.type === AddressType.PINCODE)
  @IsDefined()
  @ValidateNested()
  @Type(() => PincodeAddressDto)
  pincodeAddress?: PincodeAddressDto;

  @IsOptional()
  @ValidateIf((dto: DealerAddressDto) => dto.type === AddressType.COORDINATES)
  @IsDefined()
  @ValidateNested()
  @Type(() => CoordinatesAddressDto)
  coordinatesAddress?: CoordinatesAddressDto;
}