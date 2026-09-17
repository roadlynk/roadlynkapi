import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AccountType, HolderType } from '../../common/enums/bank-details.enum';

export type BankDetailsDocument = BankDetails & Document;

@Schema({
  timestamps: true,
})
export class BankDetails {
  @Prop({
    required: true,
    trim: true,
  })
  bankName!: string;

  @Prop({
    required: true,
    trim: true,
  })
  accountNumber!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  ifscCode!: string;

  @Prop({
    required: true,
    trim: true,
  })
  branchName!: string;

  @Prop({
    type: String,
    enum: AccountType,
    required: true,
  })
  accountType!: AccountType;

  @Prop({
    type: String,
    enum: HolderType,
    required: true,
  })
  holderType!: HolderType;

  // References Company, Owner, or Driver collection depending on holderType
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'holderType',
  })
  holderId!: Types.ObjectId;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const BankDetailsSchema = SchemaFactory.createForClass(BankDetails);
BankDetailsSchema.index(
  { holderType: 1, holderId: 1, bankName: 1, accountNumber: 1 },
  { unique: true },
);
