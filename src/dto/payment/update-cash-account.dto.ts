import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CashAccountType } from '../../common/enums/cash-account.enum';

export class UpdateCashAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(CashAccountType)
  type?: CashAccountType;
}
