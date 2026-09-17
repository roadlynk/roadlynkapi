import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({
  timestamps: true,
})
export class Client {
  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  })
  clientCode!: string;

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

export const ClientSchema = SchemaFactory.createForClass(Client);
ClientSchema.index({ companyId: 1, clientCode: 1 }, { unique: true });
