import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AddressPincode {
  @Prop({
    required: true,
    trim: true,
  })
  pincode!: string;

  @Prop({
    required: true,
    trim: true,
  })
  state!: string;

  @Prop({
    required: true,
    trim: true,
  })
  district!: string;

  @Prop({
    required: true,
    trim: true,
  })
  town!: string;

  @Prop({
    required: true,
    trim: true,
  })
  fullAddress!: string;
}

export const AddressSchema = SchemaFactory.createForClass(AddressPincode);
