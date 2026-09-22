import { Type } from 'class-transformer';
import { IsMongoId, IsString, ValidateNested } from 'class-validator';
import { DealerAddressDto } from './dealer-address.dto';

export class CreateDealerDto {
  @IsMongoId()
  clientId!: string;

  @IsString()
  dealerName!: string;

  @IsString()
  code!: string;

  @ValidateNested()
  @Type(() => DealerAddressDto)
  address!: DealerAddressDto;
}