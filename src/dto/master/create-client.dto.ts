import { IsMongoId, IsString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name!: string;

  @IsString()
  clientCode!: string;

  @IsMongoId()
  companyId!: string;
}
