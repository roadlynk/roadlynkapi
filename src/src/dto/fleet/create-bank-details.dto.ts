import { IsBoolean, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AccountType, HolderType } from '../../common/enums/bank-details.enum';

export class CreateBankDetailsDto {
  @IsString()
  bankName!: string;

  @IsString()
  accountNumber!: string;

  @IsString()
  ifscCode!: string;

  @IsString()
  branchName!: string;

  @IsEnum(AccountType)
  accountType!: AccountType;

  @IsEnum(HolderType)
  holderType!: HolderType;

  @IsMongoId()
  holderId!: string;

  @IsMongoId()
  companyId!: string;

  @IsOptional()
  @IsBoolean()
  isRental?: boolean;
}
