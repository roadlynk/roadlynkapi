import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ActionResourceType } from '../../common/enums/action-resource-type.enum';

export type ActionDocument = Action & Document;

@Schema({
  timestamps: true,
})
export class Action {
  @Prop({
    type: Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true,
  })
  companyId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ActionResourceType,
    required: true,
    trim: true,
    index: true,
  })
  resourceType!: ActionResourceType;

  @Prop({
    type: Types.ObjectId,
    required: true,
    index: true,
  })
  resourceId!: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  text!: string;

  @Prop({
    default: false,
  })
  isDone!: boolean;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
