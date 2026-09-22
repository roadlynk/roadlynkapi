import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BunkDocument = Bunk & Document;

@Schema({
  timestamps: true,
})
export class Bunk {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  name!: string;
}

export const BunkSchema = SchemaFactory.createForClass(Bunk);
BunkSchema.index(
  {
    companyId: 1,
    name: 1,
  },
  { unique: true },
);
