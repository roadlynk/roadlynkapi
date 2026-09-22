import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GstConfigurerDocument = GstConfigurer & Document;

@Schema({
  timestamps: true,
})
export class GstConfigurer {
  @Prop({
    required: true,
    trim: true,
    uppercase: true,
  })
  code!: string;

  @Prop({
    required: true,
    type: Number,
    min: 0,
  })
  percentage!: number;

  @Prop({
    required: true,
    type: Date,
  })
  effectiveFrom!: Date;

  @Prop({
    type: Date,
  })
  effectiveTo?: Date;

  @Prop({
    default: true,
  })
  isActive!: boolean;
}

export const GstConfigurerSchema = SchemaFactory.createForClass(GstConfigurer);
GstConfigurerSchema.index(
  { isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } },
);
