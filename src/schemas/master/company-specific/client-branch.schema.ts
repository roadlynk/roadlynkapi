import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientBranchDocument = ClientBranch & Document;

@Schema({
  timestamps: true,
})
export class ClientBranch {
  @Prop({
    required: true,
    trim: true,
  })
  branchName!: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  })
  clientId!: Types.ObjectId;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const ClientBranchSchema = SchemaFactory.createForClass(ClientBranch);
ClientBranchSchema.index({ clientId: 1, branchName: 1 }, { unique: true });
