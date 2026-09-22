import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransportRateDocument = TransportRate & Document;

@Schema({
  timestamps: true,
})
export class TransportRate {
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
    ref: 'Client',
    required: true,
    index: true,
  })
  consigneeId!: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Dealer',
    required: true,
    index: true,
  })
  dealerId!: Types.ObjectId;

  @Prop({
    type: [
      {
        fromLimit: { type: Number, required: true, min: 0 },
        toLimit: { type: Number, required: true, min: 0 },
        transportRate: {
          type: [{ type: Number, required: true, min: 0 }],
          required: true,
        },
      },
    ],
    required: true,
  })
  tonnageRate!: Array<{
    fromLimit: number;
    toLimit: number;
    transportRate: number[];
  }>;

  @Prop({ type: Date, required: true })
  effectiveFrom!: Date;

  @Prop({ type: Date, default: null })
  effectiveTo!: Date | null;

  @Prop({ required: true, type: Number, min: 0 })
  calculatedDistance!: number;

  @Prop({ required: true, type: Number, min: 0 })
  companyDistance!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Material',
    required: true,
    index: true,
  })
  materialId!: Types.ObjectId;
}

export const TransportRateSchema = SchemaFactory.createForClass(TransportRate);
TransportRateSchema.index(
  {
    companyId: 1,
    consignorId: 1,
    consignorBranchId: 1,
    consigneeId: 1,
    dealerId: 1,
    materialId: 1,
  },
  { unique: true, partialFilterExpression: { isActive: true } },
);
