import { IsEnum, IsISO8601, IsMongoId, IsNumber, Min } from 'class-validator';
import { HolderType } from '../../common/enums/bank-details.enum';
import { PaymentResourceType } from '../../common/enums/pending-payment.enum';

export class CreatePendingPaymentDto {
  @IsISO8601()
  date!: string;

  @IsEnum(PaymentResourceType)
  resourceType!: PaymentResourceType;

  @IsMongoId()
  resourceId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsEnum(HolderType)
  receiverType!: HolderType;

  @IsMongoId()
  receiverId!: string;

  @IsMongoId()
  receiverBankId!: string;
}
