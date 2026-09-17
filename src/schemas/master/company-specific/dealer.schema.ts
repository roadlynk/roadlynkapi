import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AddressType } from '../../../common/enums/address-type.enum';
import {
  AddressCoordinates,
  AddressCoordinatesSchema,
} from '../../common/address-coordinates.schema';
import { AddressPincode, AddressSchema } from '../../common/address-pincode.schema';

export type DealerDocument = Dealer & Document;

@Schema({ _id: false })
export class DealerAddress {
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

export const DealerAddressSchema = SchemaFactory.createForClass(DealerAddress);

@Schema({ timestamps: true })
export class Dealer {
  @Prop({
    type: Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true,
  })
  clientId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  dealerName!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ type: DealerAddressSchema, required: true })
  address!: DealerAddress;

  @Prop({ default: true })
  isActive!: boolean;
}

export const DealerSchema = SchemaFactory.createForClass(Dealer);
DealerSchema.index({ clientId: 1, code: 1 }, { unique: true });