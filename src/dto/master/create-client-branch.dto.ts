import { IsMongoId, IsString } from 'class-validator';

export class CreateClientBranchDto {
  @IsString()
  branchName!: string;

  @IsMongoId()
  clientId!: string;
}
