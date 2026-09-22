import { Type } from 'class-transformer';
import { IsMongoId, IsString, ValidateNested } from 'class-validator';
import { ClientBranchAddressDto } from './client-branch-address.dto';

export class CreateClientBranchDto {
  @IsString()
  branchName!: string;

  @IsMongoId()
  clientId!: string;

  @ValidateNested()
  @Type(() => ClientBranchAddressDto)
  address!: ClientBranchAddressDto;
}
