import { IsEnum, IsMongoId, IsString } from 'class-validator';
import { CashAccountType } from '../../common/enums/cash-account.enum';

export class CreateCashAccountDto {
  @IsMongoId()
  companyId!: string;

  @IsString()
  name!: string;

  @IsEnum(CashAccountType)
  type!: CashAccountType;
}
