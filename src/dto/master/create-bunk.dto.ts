import { IsMongoId, IsString, Matches } from 'class-validator';

export class CreateBunkDto {
  @IsMongoId()
  companyId!: string;

  @IsString()
  name!: string;
}
