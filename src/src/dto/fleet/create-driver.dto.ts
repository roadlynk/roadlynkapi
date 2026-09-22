import { IsDateString, IsMongoId, IsString } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  name!: string;

  @IsString()
  licenceNumber!: string;

  @IsDateString()
  licenceExpiryDate!: string;

  @IsString()
  mobileNumber!: string;

  @IsString()
  licenceImageUrl!: string;

  @IsMongoId()
  companyId!: string;
}
