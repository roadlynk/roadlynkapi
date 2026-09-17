import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type MaterialDocument = Material & Document;

@Schema({ _id: false })
export class MaterialSpecificField {
  @Prop({
    required: true,
    trim: true,
  })
  fieldName!: string;

  @Prop({
    required: true,
    trim: true,
  })
  fieldType!: string;

  @Prop({
    type: MongooseSchema.Types.Mixed,
  })
  values?: string | number | Array<string | number>;
}

export const MaterialSpecificFieldSchema =
  SchemaFactory.createForClass(MaterialSpecificField);

@Schema({
  timestamps: true,
})
export class Material {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  material!: string;

  @Prop({
    type: [String],
    required: true,
  })
  category!: string[];

  @Prop({
    required: true,
    trim: true,
    default: 'MT',
  })
  quantityType!: string;

  @Prop({
    type: [MaterialSpecificFieldSchema],
    default: [],
  })
  materialSpecificFields?: MaterialSpecificField[];

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const MaterialSchema = SchemaFactory.createForClass(Material);
