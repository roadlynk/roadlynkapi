import { IsMongoId, IsString, Matches } from 'class-validator';

export class CreateBunkDto {
  @IsMongoId()
  companyId!: string;

  @IsString()
  @Matches(/^\s*\S.*$/, { message: 'Bunk name is required' })
  name!: string;
}
