import { IsBoolean, IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { HolderType } from '../../common/enums/bank-details.enum';

export class SetActiveBankDetailsDto {
  @IsMongoId()
  holderId!: string;

  @IsEnum(HolderType)
  holderType!: HolderType;

  @IsMongoId()
  companyId!: string;

  @IsMongoId()
  bankDetailsId!: string;

  @IsOptional()
  @IsBoolean()
  isRental?: boolean;
}
