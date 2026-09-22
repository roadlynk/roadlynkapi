import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { AddressPincode, AddressSchema } from '../common/address-pincode.schema';

export type OwnerDocument = Owner & Document;

export enum AccountGroup {
  ASSET = 'ASSET',
  CREDIT = 'CREDIT',
}

export enum OpeningBalanceType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

@Schema({
  timestamps: true,
})
export class Owner {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    trim: true,
  })
  phoneNumber!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
  })
  email!: string;

  @Prop({
    required: true,
    trim: true,
    unique: false,
  })
  aadharNumber!: string;

  @Prop({
    type: AddressSchema,
    required: true,
  })
  address!: AddressPincode;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  panNumber!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  gstin!: string;

  @Prop({
    required: true,
    default: false,
  })
  isRental!: boolean;

  @Prop({
    type: String,
    enum: AccountGroup,
    required: true,
  })
  accountGroup!: AccountGroup;

  @Prop({
    type: Number,
    required: true,
    default: 0,
  })
  openingBalance!: number;

  @Prop({
    type: String,
    enum: OpeningBalanceType,
    required: true,
  })
  openingBalanceType!: OpeningBalanceType;

  @Prop({
    type: String,
    trim: true,
  })
  tdsCertificateUrl?: string;

  @Prop({
    type: [String],
    default: [],
    required: true,
  })
  tdsTruckNumber?: string[];

  @Prop({
    type: Number,
    default: 0,
  })
  tdsPercentage?: number;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const OwnerSchema = SchemaFactory.createForClass(Owner);
OwnerSchema.index({ companyId: 1, panNumber: 1 }, { unique: true });
OwnerSchema.index({ companyId: 1, phoneNumber: 1 }, { unique: true });
OwnerSchema.index({ companyId: 1, email: 1 }, { unique: true });
OwnerSchema.index({ companyId: 1, aadharNumber: 1 }, { unique: true });
