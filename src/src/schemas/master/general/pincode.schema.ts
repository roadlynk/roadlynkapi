import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PincodeDocument = Pincode & Document;

@Schema({
  timestamps: true,
})
export class Pincode {
  @Prop({
    required: true,
    trim: true,
  })
  statename!: string;

  @Prop({
    required: true,
    trim: true,
  })
  district!: string;

  @Prop({
    required: true,
    trim: true,
  })
  pincode!: string;

  @Prop({
    type: [String],
    default: [],
  })
  officename!: string[];
}

export const PincodeSchema = SchemaFactory.createForClass(Pincode);
PincodeSchema.index({ pincode: 1 });
