import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ClientBranchAddressDto } from './client-branch-address.dto';

export class UpdateClientBranchDto {
  @IsOptional()
  @IsString()
  branchName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClientBranchAddressDto)
  address?: ClientBranchAddressDto;
}
