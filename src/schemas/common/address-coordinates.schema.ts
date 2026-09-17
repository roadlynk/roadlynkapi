import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class AddressCoordinates {
  @Prop({
    required: true,
    type: Number,
  })
  latitude!: number;

  @Prop({
    required: true,
    type: Number,
  })
  longitude!: number;

  @Prop({
    required: true,
    trim: true,
  })
  fullAddress!: string;
}

export const AddressCoordinatesSchema =
  SchemaFactory.createForClass(AddressCoordinates);
