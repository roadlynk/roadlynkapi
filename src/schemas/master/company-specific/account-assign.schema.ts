import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountAssignDocument = AccountAssign & Document;

@Schema({
  timestamps: true,
})
export class AccountAssign {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  })
  consignorId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ClientBranch',
    required: true,
    index: true,
  })
  consignorBranchId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CashAccount',
    required: true,
  })
  accountId!: Types.ObjectId;
}

export const AccountAssignSchema = SchemaFactory.createForClass(AccountAssign);
AccountAssignSchema.index(
  {
    companyId: 1,
    consignorId: 1,
    consignorBranchId: 1,
  },
  { unique: true },
);
