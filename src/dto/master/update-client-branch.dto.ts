import { IsOptional, IsString } from 'class-validator';

export class UpdateClientBranchDto {
  @IsOptional()
  @IsString()
  branchName?: string;
}
