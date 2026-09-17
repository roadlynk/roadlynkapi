import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AddressType } from '../../../common/enums/address-type.enum';
import {
  AddressCoordinates,
  AddressCoordinatesSchema,
} from '../../common/address-coordinates.schema';
import { AddressPincode, AddressSchema } from '../../common/address-pincode.schema';

export type ClientBranchDocument = ClientBranch & Document;

@Schema({ _id: false })
export class ClientBranchAddress {
  @Prop({
    type: String,
    enum: AddressType,
    required: true,
  })
  type!: AddressType;

  @Prop({ type: AddressSchema })
  pincodeAddress?: AddressPincode;

  @Prop({ type: AddressCoordinatesSchema })
  coordinatesAddress?: AddressCoordinates;
}

export const ClientBranchAddressSchema =
  SchemaFactory.createForClass(ClientBranchAddress);

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

  @Prop({ type: ClientBranchAddressSchema, required: true })
  address!: ClientBranchAddress;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const ClientBranchSchema = SchemaFactory.createForClass(ClientBranch);
ClientBranchSchema.index({ clientId: 1, branchName: 1 }, { unique: true });
