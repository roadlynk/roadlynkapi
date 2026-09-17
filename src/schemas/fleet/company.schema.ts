import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { AddressPincode, AddressSchema } from '../common/address-pincode.schema';

export type CompanyDocument = Company & Document;

@Schema({
  timestamps: true,
})
export class Company {
  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  })
  companyCode!: string;

  @Prop({
    required: true,
    trim: true,
  })
  companyName!: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  })
  contactEmail!: string;

  @Prop({
    required: true,
    trim: true,
    unique: true,
  })
  contactNumber!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  })
  gstin!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  })
  pan!: string;

  @Prop({
    type: AddressSchema,
    required: true,
  })
  address!: AddressPincode;

  @Prop({
    trim: true,
  })
  internalNotes?: string;

  @Prop({
    default: true,
  })
  isActive!: boolean;

  @Prop({
    default: false,
  })
  isSaasClient!: boolean;

  @Prop({
    default: 0,
  })
  lastDcSequence!: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);

