import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CashAccountType } from '../../common/enums/cash-account.enum';

export type CashAccountDocument = CashAccount & Document;

@Schema({
  timestamps: true,
})
export class CashAccount {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: String,
    enum: CashAccountType,
    required: true,
  })
  type!: CashAccountType;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const CashAccountSchema = SchemaFactory.createForClass(CashAccount);
