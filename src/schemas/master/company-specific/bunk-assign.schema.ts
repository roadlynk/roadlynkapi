import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BunkAssignDocument = BunkAssign & Document;

@Schema({
  timestamps: true,
})
export class BunkAssign {
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
    ref: 'Bunk',
    required: true,
  })
  bunkId!: Types.ObjectId;
}

export const BunkAssignSchema = SchemaFactory.createForClass(BunkAssign);
BunkAssignSchema.index(
  {
    companyId: 1,
    consignorId: 1,
    consignorBranchId: 1,
  },
  { unique: true },
);
