import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { DealerAddressDto } from './dealer-address.dto';

export class UpdateDealerDto {
  @IsOptional()
  @IsString()
  dealerName?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DealerAddressDto)
  address?: DealerAddressDto;
}