import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DriverDocument = Driver & Document;

@Schema({
  timestamps: true,
})
export class Driver {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  licenceNumber!: string;

  @Prop({
    required: true,
    type: Date,
  })
  licenceExpiryDate!: Date;

  @Prop({
    required: true,
    trim: true,
  })
  mobileNumber!: string;

  @Prop({
    required: true,
    trim: true,
  })
  licenceImageUrl!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
DriverSchema.index({ companyId: 1, licenceNumber: 1 }, { unique: true });
DriverSchema.index({ companyId: 1, mobileNumber: 1 }, { unique: true });
