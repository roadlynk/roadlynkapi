import { IsEnum, IsMongoId } from 'class-validator';
import { HolderType } from '../../common/enums/bank-details.enum';

export class GetBankDetailsByHolderDto {
  @IsMongoId()
  holderId!: string;

  @IsEnum(HolderType)
  holderType!: HolderType;

  @IsMongoId()
  companyId!: string;
}
